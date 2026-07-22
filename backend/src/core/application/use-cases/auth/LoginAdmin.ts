import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { BcryptService } from '../../../../infrastructure/security/BcryptService';
import { JwtService, TokenPayload } from '../../../../infrastructure/security/JwtService';

export class LoginAdminUseCase {
  constructor(
    private adminRepo: IAdminRepository,
    private auditLogRepo: IAuditLogRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService
  ) {}

  async execute(email: string, password: string, ipAddress: string): Promise<{ success: boolean; token?: string; mustChangePassword?: boolean; error?: string }> {
    const admin = await this.adminRepo.findByEmail(email);

    if (!admin) {
      await this.auditLogRepo.create({
        adminEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'Admin not found', ip: ipAddress },
      });
      return { success: false, error: 'No admin account found with this email.' };
    }

    // Check if locked out
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000);
      await this.auditLogRepo.create({
        adminEmail: email,
        action: 'ACCOUNT_LOCKED',
        details: { reason: 'Tried to login while locked', ip: ipAddress },
      });
      return {
        success: false,
        error: `Account temporarily locked due to multiple failed attempts. Try again in ${remainingMinutes} minute(s).`,
      };
    }

    const passwordHash = admin.password || '';
    const isPasswordValid = await this.bcryptService.compare(password, passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = (admin.failedLoginAttempts || 0) + 1;
      const updates: Partial<typeof admin> = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 3) {
        updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await this.adminRepo.update(admin.id!, updates);

        await this.auditLogRepo.create({
          adminEmail: email,
          action: 'ACCOUNT_LOCKED',
          details: { reason: 'Account locked due to 3 failed attempts', ip: ipAddress },
        });
        return {
          success: false,
          error: 'Account temporarily locked due to multiple failed attempts. Try again in 15 minutes.',
        };
      }

      await this.adminRepo.update(admin.id!, updates);
      await this.auditLogRepo.create({
        adminEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'Invalid password', ip: ipAddress },
      });
      return {
        success: false,
        error: `Incorrect password. You have ${3 - failedAttempts} attempt(s) left.`,
      };
    }

    // Reset failed login attempts on success
    if (admin.failedLoginAttempts && admin.failedLoginAttempts > 0 || admin.lockUntil) {
      await this.adminRepo.update(admin.id!, { failedLoginAttempts: 0, lockUntil: undefined });
    }

    await this.auditLogRepo.create({
      adminEmail: email,
      action: 'LOGIN_SUCCESS',
      details: { ip: ipAddress },
    });

    const payload: TokenPayload = {
      userId: admin.id!,
      email: admin.email,
      role: admin.role,
      stateBaseCode: admin.stateBase || 'NAT',
      fullName: admin.fullName,
      mustChangePassword: admin.mustChangePassword,
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      mustChangePassword: admin.mustChangePassword,
    };
  }
}
