import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { getChapterReadScope, resolveStateBase } from '../common/state-bases';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { getPagination, paginatedResult, Pagination } from '../common/pagination';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private memberScope(actor: AuthenticatedRequest['user']) {
    return actor.role === 'STATE_ADMIN' ? { stateBaseCode: actor.stateBaseCode } : {};
  }

  async getSummary(actor: AuthenticatedRequest['user']) {
    const chapterScope = getChapterReadScope(actor);
    const memberWhere = {
      role: { in: [UserRole.ALUMNI, UserRole.AMBASSADOR] },
      ...this.memberScope(actor),
    };
    const chapterWhere = chapterScope ? { stateBaseCode: chapterScope } : undefined;

    const [members, reunions, messages] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role', 'stateBaseCode', 'stateBaseName'],
        where: memberWhere,
        _count: { _all: true },
      }),
      this.prisma.reunionRegistration.groupBy({
        by: ['stateBaseCode'],
        where: chapterWhere,
        _count: { _all: true },
      }),
      this.prisma.contactMessage.groupBy({
        by: ['stateBaseCode'],
        where: chapterWhere,
        _count: { _all: true },
      }),
    ]);

    const bases = new Map<string, { code: string; name: string; alumni: number; ambassadors: number }>();
    let alumni = 0;
    let ambassadors = 0;
    for (const memberGroup of members) {
      const count = typeof memberGroup._count === 'object' ? memberGroup._count._all ?? 0 : 0;
      const code = memberGroup.stateBaseCode || 'NAT';
      const name = memberGroup.stateBaseName || (code === 'NAT' ? 'National' : code);
      const base = bases.get(code) || { code, name, alumni: 0, ambassadors: 0 };
      if (memberGroup.role === 'ALUMNI') {
        alumni += count;
        base.alumni += count;
      } else if (memberGroup.role === 'AMBASSADOR') {
        ambassadors += count;
        base.ambassadors += count;
      }
      bases.set(code, base);
    }

    return {
      alumni,
      ambassadors,
      reunions: reunions.reduce((total, group) => total + (group._count?._all ?? 0), 0),
      messages: messages.reduce((total, group) => total + (group._count?._all ?? 0), 0),
      bases: Array.from(bases.values()).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  private async assertMemberInScope(userId: string, actor: AuthenticatedRequest['user']) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, stateBaseCode: true },
    });
    if (!user) throw new NotFoundException('Member not found');
    if (actor.role === 'STATE_ADMIN' && user.stateBaseCode !== actor.stateBaseCode) {
      throw new NotFoundException('Member not found');
    }
    return user;
  }

  async getAlumni(actor: AuthenticatedRequest['user'], requestedCode?: string, pagination: Pagination = getPagination()) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = { role: UserRole.ALUMNI, ...(scope ? { stateBaseCode: scope } : {}) };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, fullName: true, phoneNumber: true, role: true, isApproved: true,
          stateBaseCode: true, stateBaseName: true, createdAt: true, updatedAt: true,
          alumniProfile: {
            select: {
              id: true, userId: true, otherName: true, gender: true, dateOfBirth: true, nin: true,
              residentialAddress: true, schoolAttended: true, admissionNumber: true, yearOfAdmission: true,
              yearOfGraduation: true, houseHostel: true, positionsHeld: true, highestQualification: true,
              currentOccupation: true, stateOfResidence: true, alumniMember: true, identityNumber: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.user.count({ where }),
    ]);
    const data = users.map(({ alumniProfile, ...user }) => ({ ...user, ...alumniProfile, id: user.id, userId: user.id }));
    return paginatedResult(data, total, pagination);
  }

  async getAmbassadors(actor: AuthenticatedRequest['user'], requestedCode?: string, pagination: Pagination = getPagination()) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = { role: UserRole.AMBASSADOR, ...(scope ? { stateBaseCode: scope } : {}) };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, fullName: true, phoneNumber: true, role: true, isApproved: true,
          stateBaseCode: true, stateBaseName: true, createdAt: true, updatedAt: true,
          ambassadorProfile: {
            select: {
              id: true, userId: true, gender: true, dateOfBirth: true, residentialAddress: true,
              occupation: true, organization: true, position: true, yearsOfExperience: true,
              linkedinWebsite: true, ambassadorType: true, supportCommitment: true, supportType: true,
              whyAmbassador: true, messageToStudents: true, identityNumber: true, isApproved: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.user.count({ where }),
    ]);
    const data = users.map(({ ambassadorProfile, ...user }) => ({ ...user, ...ambassadorProfile, id: user.id, userId: user.id }));
    return paginatedResult(data, total, pagination);
  }

  async getReunionRegistrations(actor: AuthenticatedRequest['user'], requestedCode?: string, pagination: Pagination = getPagination()) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = scope ? { stateBaseCode: scope } : undefined;
    const [data, total] = await Promise.all([
      this.prisma.reunionRegistration.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take,
      }),
      this.prisma.reunionRegistration.count({ where }),
    ]);
    return paginatedResult(data, total, pagination);
  }

  async getMemberDetails(id: string, role: 'ALUMNI' | 'AMBASSADOR', actor: AuthenticatedRequest['user']) {
    const member = await this.assertMemberInScope(id, actor);
    if (member.role !== role) throw new NotFoundException('Member not found');
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { alumniProfile: role === 'ALUMNI', ambassadorProfile: role === 'AMBASSADOR' },
    });
    if (!user) throw new NotFoundException('Member not found');
    const { passwordHash, alumniProfile, ambassadorProfile, ...safeUser } = user;
    return { ...safeUser, ...(alumniProfile || ambassadorProfile), id: safeUser.id, userId: safeUser.id };
  }

  async getBroadcasts(actor: AuthenticatedRequest['user'], pagination: Pagination = getPagination()) {
    const where = actor.role === 'STATE_ADMIN'
      ? { OR: [{ sentTo: 'all' }, { sentTo: 'base', targetBaseCode: actor.stateBaseCode }] }
      : {};
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

  async getProfileUpdateRequests(actor: AuthenticatedRequest['user'], pagination: Pagination = getPagination()) {
    const where = {
      status: 'pending',
      ...(actor.role === 'STATE_ADMIN' ? { user: { stateBaseCode: actor.stateBaseCode } } : {}),
    };
    const [requests, total] = await Promise.all([
      this.prisma.profileUpdateRequest.findMany({
        where,
        include: { user: { select: { fullName: true, email: true, role: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.profileUpdateRequest.count({ where }),
    ]);
    const data = requests.map(({ user, ...request }) => ({
      ...request,
      _id: request.id,
      userName: user.fullName,
      userEmail: user.email,
      userType: user.role.toLowerCase(),
    }));
    return paginatedResult(data, total, pagination);
  }

  async processProfileUpdateRequest(id: string, action: 'approve' | 'reject', actor: AuthenticatedRequest['user']) {
    if (action !== 'approve' && action !== 'reject') throw new BadRequestException('Action must be approve or reject');
    const request = await this.prisma.profileUpdateRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true, stateBaseCode: true } } },
    });
    if (!request) throw new NotFoundException('Profile update request not found');
    if (actor.role === 'STATE_ADMIN' && request.user.stateBaseCode !== actor.stateBaseCode) {
      throw new NotFoundException('Profile update request not found');
    }
    if (request.status !== 'pending') throw new ConflictException('This profile update request has already been processed');

    const changes = request.requestedChanges as Record<string, unknown>;
    const allowedFields = new Set(['fullName', 'email', 'schoolAttended']);
    if (!changes || Object.keys(changes).some((field) => !allowedFields.has(field))) {
      throw new BadRequestException('The stored profile update request contains invalid fields');
    }

    await this.prisma.$transaction(async (tx) => {
      if (action === 'approve') {
        const userChanges: { fullName?: string; email?: string } = {};
        if (typeof changes.fullName === 'string') userChanges.fullName = changes.fullName;
        if (typeof changes.email === 'string') {
          const email = changes.email.trim().toLowerCase();
          const existingUser = await tx.user.findUnique({ where: { email }, select: { id: true } });
          if (existingUser && existingUser.id !== request.user.id) {
            throw new ConflictException('That email address is already in use');
          }
          userChanges.email = email;
        }
        if (Object.keys(userChanges).length) {
          await tx.user.update({ where: { id: request.user.id }, data: userChanges });
        }
        if (typeof changes.schoolAttended === 'string') {
          if (request.user.role !== 'ALUMNI') {
            throw new BadRequestException('Only alumni can update their school attended');
          }
          await tx.alumniProfile.upsert({
            where: { userId: request.user.id },
            create: { userId: request.user.id, schoolAttended: changes.schoolAttended },
            update: { schoolAttended: changes.schoolAttended },
          });
        }
      }

      await tx.profileUpdateRequest.update({
        where: { id },
        data: { status: action === 'approve' ? 'approved' : 'rejected', processedAt: new Date(), processedBy: actor.sub },
      });
    });

    await this.logAudit(actor.email, `${action.toUpperCase()}_PROFILE_UPDATE`, {
      requestId: id,
      userId: request.user.id,
      changes: action === 'approve' ? changes : undefined,
    }, actor.sub);
    return { success: true, message: `Profile update request ${action}d successfully.` };
  }

  async createBroadcast(data: { subject: string; message: string; sentTo?: string; targetBaseCode?: string; targetBaseName?: string }, actor: AuthenticatedRequest['user']) {
    let sentTo = data.sentTo || 'all';
    let targetBaseCode = data.targetBaseCode || null;
    let targetBaseName = data.targetBaseName || null;
    if (sentTo !== 'all' && sentTo !== 'base') {
      throw new BadRequestException('Broadcast audience must be all or a state base');
    }
    if (actor.role === 'STATE_ADMIN') {
      if (sentTo !== 'base' || (targetBaseCode && targetBaseCode !== actor.stateBaseCode)) {
        throw new BadRequestException('State administrators can only broadcast to their assigned state base');
      }
      sentTo = 'base';
      targetBaseCode = actor.stateBaseCode!;
      targetBaseName = actor.stateBaseName || targetBaseCode;
    } else if (sentTo === 'base') {
      if (!targetBaseCode) throw new BadRequestException('Select a state base for this broadcast');
      const stateBase = resolveStateBase({ stateBaseCode: targetBaseCode });
      targetBaseCode = stateBase.stateBaseCode;
      targetBaseName = stateBase.stateBaseName;
    } else {
      targetBaseCode = null;
      targetBaseName = null;
    }
    const broadcast = await this.prisma.broadcast.create({
      data: {
        subject: data.subject,
        message: data.message,
        sentTo,
        targetBaseCode,
        targetBaseName,
        sentBy: actor.email,
      },
    });
    await this.logAudit(actor.email, 'CREATE_BROADCAST', {
      broadcastId: broadcast.id,
      sentTo: broadcast.sentTo,
      targetBaseCode: broadcast.targetBaseCode,
    }, actor.sub);
    return broadcast;
  }

  private async generateIdentityNumber(type: 'alumni' | 'ambassador', stateBaseCode?: string | null, stateBaseName?: string | null): Promise<string> {
    let chapter = 'NAT';
    if (stateBaseName) {
      chapter = stateBaseName.replace(/\s*base$/i, '').trim().toUpperCase();
    } else if (stateBaseCode) {
      chapter = stateBaseCode.toUpperCase();
    }
    const year = new Date().getFullYear();
    // Count existing members of this type for sequential numbering
    const count = type === 'alumni'
      ? await this.prisma.alumniProfile.count({ where: { identityNumber: { not: null } } })
      : await this.prisma.ambassadorProfile.count({ where: { identityNumber: { not: null } } });
    const seq = String(count + 1).padStart(4, '0');
    return `NPAE/${chapter}/${year}/${seq}`;
  }

  async logAudit(actorEmail: string, action: string, details?: any, actorId?: string) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          actorEmail,
          actorId,
          action,
          details: details ? details : undefined,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write audit event', err instanceof Error ? err.stack : String(err));
      throw new InternalServerErrorException('The operation could not be recorded in the audit log');
    }
  }

  async approveUser(userId: string, userType: 'alumni' | 'ambassador', actor: AuthenticatedRequest['user']) {
    const target = await this.assertMemberInScope(userId, actor);
    if ((userType === 'alumni' && target.role !== 'ALUMNI') || (userType === 'ambassador' && target.role !== 'AMBASSADOR')) {
      throw new BadRequestException('Member type does not match the selected approval action');
    }
    // Mark the user as approved so they can log in
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
      select: { email: true, fullName: true, stateBaseCode: true, stateBaseName: true },
    });

    // Generate a unique identity number formatted as NPAE/STATE CHAPTER/YEAR/0001
    const identityNumber = await this.generateIdentityNumber(userType, user.stateBaseCode, user.stateBaseName);

    let profileResult: any;
    if (userType === 'alumni') {
      profileResult = await this.prisma.alumniProfile.update({
        where: { userId },
        data: { isVerified: true, identityNumber },
      });
    } else {
      profileResult = await this.prisma.ambassadorProfile.update({
        where: { userId },
        data: { isApproved: true, identityNumber },
      });
    }
    const emailSent = await this.mail.sendWelcomeEmail({
      to: user.email,
      fullName: user.fullName,
      identityNumber,
      memberType: userType,
    });

    // Record audit log
    await this.logAudit(actor.email, userType === 'alumni' ? 'APPROVE_ALUMNI' : 'APPROVE_AMBASSADOR', {
      userId,
      targetEmail: user.email,
      fullName: user.fullName,
      identityNumber,
      chapter: user.stateBaseName || user.stateBaseCode || 'NAT',
    }, actor.sub);

    return {
      success: true,
      data: { ...profileResult, identityNumber },
      emailSent,
      message: emailSent
        ? `${userType === 'alumni' ? 'Alumni' : 'Ambassador'} approved successfully.`
        : `${userType === 'alumni' ? 'Alumni' : 'Ambassador'} approved, but the welcome email could not be sent.`,
    };
  }

  async deleteAlumni(id: string, actor: AuthenticatedRequest['user']) {
    const profile = await this.prisma.alumniProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true },
    });

    let deletedEmail = '';
    let deletedName = '';
    if (profile) {
      if (profile.user.role !== 'ALUMNI') throw new NotFoundException('Alumni record not found.');
      if (actor.role === 'STATE_ADMIN' && profile.user.stateBaseCode !== actor.stateBaseCode) {
        throw new NotFoundException('Alumni record not found.');
      }
      deletedEmail = profile.user.email;
      deletedName = profile.user.fullName;
      await this.prisma.user.delete({ where: { id: profile.userId } });
    } else {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (user) {
        if (user.role !== 'ALUMNI') throw new NotFoundException('Alumni record not found.');
        if (actor.role === 'STATE_ADMIN' && user.stateBaseCode !== actor.stateBaseCode) {
          throw new NotFoundException('Alumni record not found.');
        }
        deletedEmail = user.email;
        deletedName = user.fullName;
        await this.prisma.user.delete({ where: { id: user.id } });
      } else {
        throw new Error('Alumni record not found.');
      }
    }

    await this.logAudit(actor.email, 'DELETE_ALUMNI', { recordId: id, targetEmail: deletedEmail, fullName: deletedName }, actor.sub);
    return { success: true, message: 'Alumni record deleted successfully.' };
  }

  async deleteAmbassador(id: string, actor: AuthenticatedRequest['user']) {
    const profile = await this.prisma.ambassadorProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true },
    });

    let deletedEmail = '';
    let deletedName = '';
    if (profile) {
      if (profile.user.role !== 'AMBASSADOR') throw new NotFoundException('Ambassador record not found.');
      if (actor.role === 'STATE_ADMIN' && profile.user.stateBaseCode !== actor.stateBaseCode) {
        throw new NotFoundException('Ambassador record not found.');
      }
      deletedEmail = profile.user.email;
      deletedName = profile.user.fullName;
      await this.prisma.user.delete({ where: { id: profile.userId } });
    } else {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (user) {
        if (user.role !== 'AMBASSADOR') throw new NotFoundException('Ambassador record not found.');
        if (actor.role === 'STATE_ADMIN' && user.stateBaseCode !== actor.stateBaseCode) {
          throw new NotFoundException('Ambassador record not found.');
        }
        deletedEmail = user.email;
        deletedName = user.fullName;
        await this.prisma.user.delete({ where: { id: user.id } });
      } else {
        throw new Error('Ambassador record not found.');
      }
    }

    await this.logAudit(actor.email, 'DELETE_AMBASSADOR', { recordId: id, targetEmail: deletedEmail, fullName: deletedName }, actor.sub);
    return { success: true, message: 'Ambassador record deleted successfully.' };
  }

  async getBoardMembers() {
    return this.prisma.boardMember.findMany({ orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }] });
  }

  async createBoardMember(data: { name: string; role: string; bio: string; photoUrl: string; isFeatured?: boolean; linkedin?: string; twitter?: string }, adminEmail: string, adminId: string) {
    const created = await this.prisma.boardMember.create({ data: { ...data, isFeatured: !!data.isFeatured } });
    await this.logAudit(adminEmail, 'CREATE_LEADERSHIP', { name: data.name, role: data.role }, adminId);
    return created;
  }

  async updateBoardMember(id: string, data: Partial<{ name: string; role: string; bio: string; photoUrl: string; isFeatured: boolean; linkedin: string; twitter: string }>, adminEmail: string, adminId: string) {
    const updated = await this.prisma.boardMember.update({ where: { id }, data });
    await this.logAudit(adminEmail, 'UPDATE_LEADERSHIP', { memberId: id, name: data.name }, adminId);
    return updated;
  }

  async deleteBoardMember(id: string, adminEmail: string, adminId: string) {
    await this.prisma.boardMember.delete({ where: { id } });
    await this.logAudit(adminEmail, 'DELETE_LEADERSHIP', { memberId: id }, adminId);
    return { success: true, message: 'Board member deleted successfully.' };
  }

  async getAdmins() {
    return this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'] } },
      select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, stateBaseCode: true, stateBaseName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdmin(data: { fullName: string; email: string; password: string; role: 'NATIONAL_ADMIN' | 'STATE_ADMIN'; stateBase?: string; stateBaseCode?: string; stateBaseName?: string }, actor: AuthenticatedRequest['user']) {
    if (actor.role !== 'SUPER_ADMIN') throw new BadRequestException('Only a super administrator can create admin accounts');
    if (data.role !== 'NATIONAL_ADMIN' && data.role !== 'STATE_ADMIN') {
      throw new BadRequestException('Only state and national administrator roles can be created');
    }
    const stateBase = data.role === 'STATE_ADMIN' ? resolveStateBase(data) : { stateBaseCode: null, stateBaseName: null };
    if (data.role === 'STATE_ADMIN' && stateBase.stateBaseCode === 'NAT') {
      throw new BadRequestException('A state administrator must be assigned to a state base');
    }
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('An admin with this email already exists.');
    const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });
    const admin = await this.prisma.user.create({
      data: { email, fullName: data.fullName.trim(), passwordHash, role: data.role, ...stateBase },
      select: { id: true, email: true, fullName: true, role: true, stateBaseCode: true, stateBaseName: true, createdAt: true },
    });
    await this.logAudit(actor.email, 'CREATE_ADMIN', { newAdminEmail: email, role: data.role, stateBaseCode: stateBase.stateBaseCode }, actor.sub);
    return { success: true, data: admin, message: 'Admin account created successfully.' };
  }

  async deleteAdmin(id: string, actor: AuthenticatedRequest['user']) {
    if (actor.role !== 'SUPER_ADMIN') throw new BadRequestException('Only a super administrator can delete admin accounts');
    if (id === actor.sub) throw new BadRequestException('You cannot delete your own admin account.');
    const admin = await this.prisma.user.findUnique({ where: { id }, select: { role: true, email: true } });
    if (!admin || !['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'].includes(admin.role)) throw new Error('Admin not found.');
    if (admin.role === 'SUPER_ADMIN') throw new BadRequestException('Super administrator accounts cannot be deleted here.');
    await this.prisma.user.delete({ where: { id } });
    await this.logAudit(actor.email, 'DELETE_ADMIN', { deletedAdminId: id, deletedAdminEmail: admin.email }, actor.sub);
    return { success: true, message: 'Admin deleted successfully.' };
  }

  async getAuditLogs(limit = 100, actor?: AuthenticatedRequest['user']) {
    const safeLimit = Number.isInteger(limit) ? Math.max(1, Math.min(limit, 500)) : 100;
    return this.prisma.auditLog.findMany({
      where: actor?.role === 'STATE_ADMIN' ? { actorId: actor.sub } : {},
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  }
}
