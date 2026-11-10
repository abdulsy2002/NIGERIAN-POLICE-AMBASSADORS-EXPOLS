import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as argon2 from 'argon2';
import { RegisterAmbassadorDto } from './dto/register-ambassador.dto';
import { resolveStateBase } from '../common/state-bases';
import { validateBase64Upload } from '../common/base64-upload';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AmbassadorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterAmbassadorDto) {
    validateBase64Upload(dto.passportPhoto, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 2 * 1024 * 1024, 'Passport photo');
    validateBase64Upload(dto.supportingDocument, [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ], 4 * 1024 * 1024, 'Supporting document');
    const email = dto.email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { ambassadorProfile: true },
    });

    const stateBase = resolveStateBase({
      stateBase: dto.stateBase || dto.state,
      stateBaseCode: dto.stateBaseCode,
      stateBaseName: dto.stateBaseName,
    });

    const profileData = {
      gender: dto.gender || 'Not specified',
      dateOfBirth: dto.dateOfBirth || '',
      residentialAddress: dto.residentialAddress || '',
      passportPhoto: dto.passportPhoto,
      occupation: dto.occupation || '',
      organization: dto.organization,
      position: dto.position,
      yearsOfExperience: dto.yearsOfExperience,
      linkedinWebsite: dto.linkedinWebsite,
      ambassadorType: dto.ambassadorType || 'General Ambassador',
      supportCommitment: dto.supportCommitment || 'General Support',
      supportType: dto.supportType || 'Mentorship',
      whyAmbassador: dto.whyAmbassador || '',
      messageToStudents: dto.messageToStudents,
      supportingDocument: dto.supportingDocument,
    };
    let emailSent: boolean | undefined;

    if (user) {
      if (user.role !== 'AMBASSADOR') throw new ConflictException('This email is already registered for another account type');
      if (user.ambassadorProfile) {
        await this.prisma.ambassadorProfile.update({
          where: { userId: user.id },
          data: profileData,
        });
      } else {
        await this.prisma.ambassadorProfile.create({
          data: {
            userId: user.id,
            ...profileData,
          },
        });
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: dto.fullName ? dto.fullName.trim() : user.fullName,
          phoneNumber: dto.phoneNumber || user.phoneNumber,
        },
      });
    } else {
      const passwordHash = await argon2.hash(dto.password || 'Password@123', { type: argon2.argon2id });
      await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: (dto.fullName || email.split('@')[0]).trim(),
          phoneNumber: dto.phoneNumber,
          ...stateBase,
          role: 'AMBASSADOR',
          ambassadorProfile: {
            create: profileData,
          },
        },
        include: { ambassadorProfile: true },
      });
      emailSent = await this.mail.sendRegistrationReceivedEmail({
        to: email,
        fullName: (dto.fullName || email.split('@')[0]).trim(),
        memberType: 'ambassador',
      });
    }

    return {
      success: true,
      ...(emailSent !== undefined && { emailSent }),
      message: emailSent === false
        ? 'Registration completed, but the confirmation email could not be sent. Please contact support.'
        : 'Ambassador registration completed successfully. Awaiting admin approval.',
    };
  }
}
