import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as argon2 from 'argon2';
import { RegisterAlumniDto } from './dto/register-alumni.dto';
import { resolveStateBase } from '../common/state-bases';
import { validateBase64Upload } from '../common/base64-upload';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AlumniService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterAlumniDto) {
    validateBase64Upload(dto.passportPhoto, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 2 * 1024 * 1024, 'Passport photo');
    validateBase64Upload(dto.ssceCertificate, [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ], 4 * 1024 * 1024, 'SSCE certificate');
    const email = dto.email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { alumniProfile: true },
    });

    const profileData = {
      otherName: dto.otherName,
      gender: dto.gender || 'Not specified',
      dateOfBirth: dto.dateOfBirth || '',
      nin: dto.nin || '',
      residentialAddress: dto.residentialAddress || '',
      passportPhoto: dto.passportPhoto,
      schoolAttended: dto.schoolAttended || '',
      admissionNumber: dto.admissionNumber || '',
      yearOfAdmission: dto.yearOfAdmission,
      yearOfGraduation: dto.yearOfGraduation || new Date().getFullYear(),
      houseHostel: dto.houseHostel,
      positionsHeld: dto.positionsHeld,
      ssceCertificate: dto.ssceCertificate,
      highestQualification: dto.highestQualification || '',
      currentOccupation: dto.currentOccupation || '',
      stateOfResidence: dto.stateOfResidence || '',
      alumniMember: dto.alumniMember || 'Yes',
    };

    const stateBase = resolveStateBase({
      stateBase: dto.stateBase || dto.stateOfResidence,
      stateBaseCode: dto.stateBaseCode,
      stateBaseName: dto.stateBaseName,
    });
    let emailSent: boolean | undefined;

    if (user) {
      if (user.role !== 'ALUMNI') throw new ConflictException('This email is already registered for another account type');
      if (user.alumniProfile) {
        await this.prisma.alumniProfile.update({
          where: { userId: user.id },
          data: profileData,
        });
      } else {
        await this.prisma.alumniProfile.create({
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
          role: 'ALUMNI',
          alumniProfile: {
            create: profileData,
          },
        },
        include: { alumniProfile: true },
      });
      emailSent = await this.mail.sendRegistrationReceivedEmail({
        to: email,
        fullName: (dto.fullName || email.split('@')[0]).trim(),
        memberType: 'alumni',
      });
    }

    return {
      success: true,
      ...(emailSent !== undefined && { emailSent }),
      message: emailSent === false
        ? 'Registration completed, but the confirmation email could not be sent. Please contact support.'
        : 'Alumni registration completed successfully.',
    };
  }
}
