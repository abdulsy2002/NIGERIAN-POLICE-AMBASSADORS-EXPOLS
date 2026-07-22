import { IAlumniRepository } from '../../../domain/repositories/IAlumniRepository';
import { IAmbassadorRepository } from '../../../domain/repositories/IAmbassadorRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { BcryptService } from '../../../../infrastructure/security/BcryptService';
import { JwtService, TokenPayload } from '../../../../infrastructure/security/JwtService';

export class LoginUserUseCase {
  constructor(
    private alumniRepo: IAlumniRepository,
    private ambassadorRepo: IAmbassadorRepository,
    private auditLogRepo: IAuditLogRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService
  ) {}

  async execute(email: string, password: string, ipAddress: string): Promise<{ success: boolean; token?: string; error?: string }> {
    let user: any = await this.alumniRepo.findByEmail(email);
    let userType: 'alumni' | 'ambassador' = 'alumni';

    if (!user) {
      user = await this.ambassadorRepo.findByEmail(email);
      userType = 'ambassador';
    }

    if (!user) {
      await this.auditLogRepo.create({
        adminEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'User not found', ip: ipAddress },
      });
      return { success: false, error: 'User not found.' };
    }

    // Check if locked out
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
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

    // Verify Password
    const passwordHash = user.password || '';
    const isPasswordValid = await this.bcryptService.compare(password, passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: Partial<typeof user> = { failedLoginAttempts: failedAttempts };

      if (failedAttempts >= 2) {
        updates.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        
        if (userType === 'alumni') {
          await this.alumniRepo.update(user.id!, updates);
        } else {
          await this.ambassadorRepo.update(user.id!, updates);
        }

        await this.auditLogRepo.create({
          adminEmail: email,
          action: 'ACCOUNT_LOCKED',
          details: { reason: 'Account locked due to 2 failed attempts', ip: ipAddress },
        });
        return {
          success: false,
          error: 'Account temporarily locked due to 2 failed attempts. Try again in 15 minutes.',
        };
      }

      if (userType === 'alumni') {
        await this.alumniRepo.update(user.id!, updates);
      } else {
        await this.ambassadorRepo.update(user.id!, updates);
      }

      await this.auditLogRepo.create({
        adminEmail: email,
        action: 'LOGIN_FAILED',
        details: { reason: 'Invalid password', ip: ipAddress },
      });
      return {
        success: false,
        error: `Incorrect password. You have ${2 - failedAttempts} attempt(s) left.`,
      };
    }

    // Check approvals
    if (userType === 'alumni' && !user.isVerified) {
      return { success: false, error: 'Account pending verification.' };
    }
    if (userType === 'ambassador' && !user.isApproved) {
      return { success: false, error: 'Application pending approval.' };
    }

    // Reset failed attempts on success
    if (user.failedLoginAttempts && user.failedLoginAttempts > 0 || user.lockUntil) {
      const updates = { failedLoginAttempts: 0, lockUntil: undefined };
      if (userType === 'alumni') {
        await this.alumniRepo.update(user.id!, updates);
      } else {
        await this.ambassadorRepo.update(user.id!, updates);
      }
    }

    await this.auditLogRepo.create({
      adminEmail: email,
      action: 'LOGIN_SUCCESS',
      details: { ip: ipAddress },
    });

    const payload: TokenPayload = {
      userId: user.id!,
      email: user.email,
      role: userType,
      stateBaseCode: user.stateBaseCode || 'NAT',
      fullName: user.fullName || '',
    };

    const token = this.jwtService.sign(payload);

    return { success: true, token };
  }
}
