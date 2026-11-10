import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { resolveStateBase } from '../common/state-bases';
import { getPagination, paginatedResult, Pagination } from '../common/pagination';
import { validateBase64Upload } from '../common/base64-upload';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const requestedRole = String(dto.userType ?? '').toUpperCase();
    if (requestedRole !== 'ALUMNI' && requestedRole !== 'AMBASSADOR') {
      throw new BadRequestException('Only alumni and ambassador accounts can be self-registered');
    }

    const userRole = requestedRole;
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const stateBase = resolveStateBase(dto);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: (dto.fullName || email.split('@')[0]).trim(),
        role: userRole,
        ...stateBase,
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, user.stateBaseCode, user.stateBaseName);
    const emailSent = await this.mail.sendRegistrationReceivedEmail({
      to: user.email,
      fullName: user.fullName,
      memberType: userRole === 'ALUMNI' ? 'alumni' : 'ambassador',
    });
    return { ...tokens, emailSent };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isAdminRole = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'].includes(user.role);
    if (!isAdminRole && !user.isApproved) {
      throw new UnauthorizedException('Your account is pending admin approval. Please wait for confirmation.');
    }

    return this.issueTokens(user.id, user.email, user.role, user.stateBaseCode, user.stateBaseName);
  }

  async loginAdmin(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const adminRoles = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'];
    if (!user || !adminRoles.includes(user.role) || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid admin email or password');
    }

    return this.issueTokens(user.id, user.email, user.role, user.stateBaseCode, user.stateBaseName);
  }

  async refresh(dto: RefreshDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const session = await this.prisma.refreshSession.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(session.user.id, session.user.email, session.user.role, session.user.stateBaseCode, session.user.stateBaseName);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshSession.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { alumniProfile: true, ambassadorProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, alumniProfile, ambassadorProfile, ...userData } = user;
    return {
      ...userData,
      ...(alumniProfile && {
        residentialAddress: alumniProfile.residentialAddress,
        passportPhoto: alumniProfile.passportPhoto,
        schoolAttended: alumniProfile.schoolAttended,
        occupation: alumniProfile.currentOccupation,
      }),
      ...(ambassadorProfile && {
        residentialAddress: ambassadorProfile.residentialAddress,
        passportPhoto: ambassadorProfile.passportPhoto,
        occupation: ambassadorProfile.occupation,
      }),
      userType: user.role.toLowerCase(),
    };
  }

  async updateProfile(userId: string, data: {
    phoneNumber?: string;
    residentialAddress?: string;
    passportPhoto?: string;
    occupation?: string;
    requestedChanges?: Record<string, unknown>;
  }) {
    const allowedFields = new Set(['phoneNumber', 'residentialAddress', 'passportPhoto', 'occupation', 'requestedChanges']);
    if (Object.keys(data).some((field) => !allowedFields.has(field))) {
      throw new BadRequestException('Some profile fields require admin approval');
    }

    const requestedChanges = data.requestedChanges && Object.keys(data.requestedChanges).length > 0
      ? this.validateRequestedChanges(data.requestedChanges)
      : undefined;
    for (const field of ['phoneNumber', 'residentialAddress', 'passportPhoto', 'occupation'] as const) {
      if (data[field] !== undefined && typeof data[field] !== 'string') {
        throw new BadRequestException(`${field} must be a string`);
      }
    }
    validateBase64Upload(data.passportPhoto, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 2 * 1024 * 1024, 'Passport photo');
    const immediateChanges = {
      ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber.trim() }),
    };
    const profileChanges = {
      ...(data.residentialAddress !== undefined && { residentialAddress: data.residentialAddress.trim() }),
      ...(data.passportPhoto !== undefined && { passportPhoto: data.passportPhoto }),
      ...(data.occupation !== undefined && { occupation: data.occupation.trim(), currentOccupation: data.occupation.trim() }),
    };

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
      if (!user) throw new NotFoundException('User not found');
      if (user.role !== 'ALUMNI' && user.role !== 'AMBASSADOR') {
        throw new BadRequestException('Administrator profiles cannot be edited here');
      }
      if (requestedChanges?.schoolAttended && user.role !== 'ALUMNI') {
        throw new BadRequestException('Only alumni can request a school attended change');
      }

      if (Object.keys(immediateChanges).length) {
        await tx.user.update({ where: { id: userId }, data: immediateChanges });
      }

      if (Object.keys(profileChanges).length) {
        if (user.role === 'ALUMNI') {
          const { occupation, currentOccupation, ...alumniChanges } = profileChanges;
          if (Object.keys(alumniChanges).length) {
            await tx.alumniProfile.upsert({
              where: { userId },
              create: { userId, ...alumniChanges },
              update: alumniChanges,
            });
          }
        } else if (user.role === 'AMBASSADOR') {
          const ambassadorChanges = {
            ...(profileChanges.residentialAddress !== undefined && { residentialAddress: profileChanges.residentialAddress }),
            ...(profileChanges.passportPhoto !== undefined && { passportPhoto: profileChanges.passportPhoto }),
            ...(profileChanges.occupation !== undefined && { occupation: profileChanges.occupation }),
          };
          if (Object.keys(ambassadorChanges).length) {
            await tx.ambassadorProfile.upsert({
              where: { userId },
              create: { userId, ...ambassadorChanges },
              update: ambassadorChanges,
            });
          }
        } else {
          throw new BadRequestException('Administrator profiles cannot be edited here');
        }
      }

      if (requestedChanges) {
        const existingRequest = await tx.profileUpdateRequest.findFirst({
          where: { userId, status: 'pending' },
          select: { id: true },
        });
        if (existingRequest) {
          throw new ConflictException('You already have a pending profile update request');
        }
        await tx.profileUpdateRequest.create({ data: { userId, requestedChanges } });
      }

      return tx.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, stateBaseCode: true },
      });
    });
    return {
      success: true,
      data: result,
      message: requestedChanges ? 'Profile update request submitted for admin approval.' : 'Profile updated successfully.',
    };
  }

  private validateRequestedChanges(rawChanges: Record<string, unknown>): Record<string, string> {
    if (!rawChanges || typeof rawChanges !== 'object' || Array.isArray(rawChanges)) {
      throw new BadRequestException('Requested profile changes are invalid');
    }
    const allowedFields = new Set(['fullName', 'email', 'schoolAttended']);
    const changes: Record<string, string> = {};
    for (const [field, rawValue] of Object.entries(rawChanges)) {
      if (!allowedFields.has(field)) throw new BadRequestException(`The ${field} field cannot be requested for approval`);
      if (typeof rawValue !== 'string' || !rawValue.trim()) {
        throw new BadRequestException(`${field} cannot be empty`);
      }
      const value = rawValue.trim();
      if (value.length > 254) throw new BadRequestException(`${field} is too long`);
      if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new BadRequestException('Please provide a valid email address');
      }
      changes[field] = field === 'email' ? value.toLowerCase() : value;
    }
    if (!Object.keys(changes).length) throw new BadRequestException('No profile changes were provided');
    return changes;
  }

  async getBroadcasts(userId: string, pagination: Pagination = getPagination()) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { stateBaseCode: true } });
    const where = {
      OR: [
        { sentTo: 'all' },
        ...(user?.stateBaseCode ? [{ sentTo: 'base', targetBaseCode: user.stateBaseCode }] : []),
      ],
    };
    const [data, total] = await Promise.all([
      this.prisma.broadcast.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.broadcast.count({ where }),
    ]);
    return paginatedResult(data, total, pagination);
  }

  private async issueTokens(userId: string, email: string, role: string, stateBaseCode?: string | null, stateBaseName?: string | null) {
    const sessionId = randomBytes(16).toString('hex');
    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      email,
      role,
      sessionId,
      stateBaseCode: stateBaseCode || undefined,
      stateBaseName: stateBaseName || undefined,
    }, { expiresIn: '15m' });
    const refreshToken = randomBytes(48).toString('base64url');

    await this.prisma.refreshSession.create({
      data: {
        id: sessionId,
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, accessToken, refreshToken };
  }

  async validateMember(rawQuery: string) {
    if (!rawQuery || !rawQuery.trim()) {
      return { success: false, message: 'Please provide an identity number, email, or name to validate.' };
    }
    const query = rawQuery.trim();

    // 1. Try finding Alumni Profile
    const alumni = await this.prisma.alumniProfile.findFirst({
      where: {
        OR: [
          { identityNumber: { equals: query, mode: 'insensitive' } },
          { admissionNumber: { equals: query, mode: 'insensitive' } },
          { user: { email: { equals: query.toLowerCase() } } },
          { user: { phoneNumber: { equals: query } } },
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isApproved: true,
            stateBaseCode: true,
            stateBaseName: true,
            createdAt: true,
          },
        },
      },
    });

    if (alumni) {
      const chapter = (alumni.user.stateBaseName || alumni.user.stateBaseCode || 'NATIONAL')
        .replace(/\s*base$/i, '')
        .replace(/\s*chapter$/i, '')
        .trim()
        .toUpperCase() + ' CHAPTER';

      return {
        success: true,
        memberType: 'alumni',
        data: {
          fullName: alumni.user.fullName,
          identityNumber: alumni.identityNumber || 'NPAE/ALUMNI',
          admissionNumber: alumni.admissionNumber || 'N/A',
          schoolAttended: alumni.schoolAttended || 'NPAE',
          graduationYear: alumni.yearOfGraduation ? String(alumni.yearOfGraduation) : 'N/A',
          chapter,
          passportPhoto: alumni.passportPhoto,
          isVerified: alumni.isVerified || alumni.user.isApproved,
          registeredDate: alumni.user.createdAt,
        },
      };
    }

    // 2. Try finding Ambassador Profile
    const ambassador = await this.prisma.ambassadorProfile.findFirst({
      where: {
        OR: [
          { identityNumber: { equals: query, mode: 'insensitive' } },
          { user: { email: { equals: query.toLowerCase() } } },
          { user: { phoneNumber: { equals: query } } },
          { user: { fullName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isApproved: true,
            stateBaseCode: true,
            stateBaseName: true,
            createdAt: true,
          },
        },
      },
    });

    if (ambassador) {
      const chapter = (ambassador.user.stateBaseName || ambassador.user.stateBaseCode || 'NATIONAL')
        .replace(/\s*base$/i, '')
        .replace(/\s*chapter$/i, '')
        .trim()
        .toUpperCase() + ' CHAPTER';

      return {
        success: true,
        memberType: 'ambassador',
        data: {
          fullName: ambassador.user.fullName,
          identityNumber: ambassador.identityNumber || 'NPAE/AMBASSADOR',
          profession: ambassador.occupation || ambassador.position || 'Ambassador',
          organization: ambassador.organization || 'NPAE',
          ambassadorType: ambassador.ambassadorType || 'National Ambassador',
          chapter,
          passportPhoto: ambassador.passportPhoto,
          isApproved: ambassador.isApproved || ambassador.user.isApproved,
          registeredDate: ambassador.user.createdAt,
        },
      };
    }

    return {
      success: false,
      message: 'No registered member found matching the provided identity number or details.',
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
