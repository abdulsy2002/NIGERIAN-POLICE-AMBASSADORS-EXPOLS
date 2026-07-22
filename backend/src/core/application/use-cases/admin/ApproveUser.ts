import { IAlumniRepository } from '../../../domain/repositories/IAlumniRepository';
import { IAmbassadorRepository } from '../../../domain/repositories/IAmbassadorRepository';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { IEmailService } from '../../services/IEmailService';

export class ApproveUserUseCase {
  constructor(
    private alumniRepo: IAlumniRepository,
    private ambassadorRepo: IAmbassadorRepository,
    private auditLogRepo: IAuditLogRepository,
    private emailService: IEmailService
  ) {}

  async execute(userId: string, userType: 'alumni' | 'ambassador', adminEmail: string): Promise<{ success: boolean; identityNumber?: string; message?: string }> {
    const Repo = userType === 'alumni' ? this.alumniRepo : this.ambassadorRepo;
    const user = await Repo.findById(userId);

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const baseCode = user.stateBaseCode || 'NAT';
    const gradYear = ('yearOfGraduation' in user ? user.yearOfGraduation : null) || new Date().getFullYear();
    const prefix = `NPAE/${baseCode}/${gradYear}/`;

    // Find last user matching this prefix
    const lastUsers = await Repo.find({ identityNumber: { $regex: `^${prefix}` } }, { sort: { identityNumber: -1 }, limit: 1 });
    let nextSequence = 1;
    if (lastUsers.length > 0 && lastUsers[0].identityNumber) {
      const lastSeqStr = lastUsers[0].identityNumber.split('/').pop();
      const lastSeq = parseInt(lastSeqStr || '0', 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const identityNumber = `${prefix}${nextSequence.toString().padStart(4, '0')}`;
    const approvalField = userType === 'alumni' ? { isVerified: true, identityNumber } : { isApproved: true, identityNumber };

    const updatedUser = await Repo.update(userId, approvalField);
    if (!updatedUser) {
      return { success: false, message: 'User not found.' };
    }

    await this.auditLogRepo.create({
      adminEmail,
      action: 'APPROVE_USER',
      targetType: userType,
      targetId: userId,
      details: { identityNumber, baseCode, gradYear },
    });

    // Send email notifications
    const emailSubject = 'Account Approved - NPAE';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003366; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0;">Nigerian Police Ambassadors Expols</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Account Approval</p>
        </div>
        
        <div style="background: #f8f9fc; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hello ${updatedUser.fullName || 'Member'},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Great news! Your account has been reviewed and approved.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Your Identity Number</p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; color: #003366;">
              ${identityNumber}
            </p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            You can now log in and access all features of the NPAE platform.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="background: #003366; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Log In Now
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Nigerian Police Ambassadors Expols (NPAE)<br>
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>
    `;

    await this.emailService.sendEmail(updatedUser.email, emailSubject, emailHtml);

    return { success: true, identityNumber };
  }
}
