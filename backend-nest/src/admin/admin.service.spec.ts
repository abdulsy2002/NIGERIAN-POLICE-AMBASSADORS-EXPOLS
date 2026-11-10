import { InternalServerErrorException, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { AdminService } from './admin.service';

describe('AdminService audit logging', () => {
  const auditLog = { create: jest.fn() };
  const prisma = {
    auditLog,
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    reunionRegistration: { groupBy: jest.fn() },
    contactMessage: { groupBy: jest.fn() },
    profileUpdateRequest: { findMany: jest.fn(), findUnique: jest.fn() },
    alumniProfile: { findFirst: jest.fn(), count: jest.fn(), update: jest.fn() },
    ambassadorProfile: { findFirst: jest.fn(), count: jest.fn(), update: jest.fn() },
    broadcast: { findMany: jest.fn(), create: jest.fn() },
  } as unknown as PrismaService;
  const mail = {} as MailService;
  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService(prisma, mail);
  });

  it('records both authenticated admin identity fields', async () => {
    auditLog.create.mockResolvedValue({ id: 'audit-1' });

    await service.logAudit('admin@example.com', 'UPDATE_LEADERSHIP', { memberId: 'member-1' }, 'admin-1');

    expect(auditLog.create).toHaveBeenCalledWith({
      data: {
        actorEmail: 'admin@example.com',
        actorId: 'admin-1',
        action: 'UPDATE_LEADERSHIP',
        details: { memberId: 'member-1' },
      },
    });
  });

  it('surfaces and logs audit persistence failures', async () => {
    auditLog.create.mockRejectedValue(new Error('database unavailable'));
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await expect(service.logAudit('admin@example.com', 'DELETE_ADMIN'))
      .rejects.toBeInstanceOf(InternalServerErrorException);
    expect(loggerError).toHaveBeenCalledWith('Failed to write audit event', expect.any(String));
  });

  it('scopes state administrator member queries to their assigned base', async () => {
    const userModel = prisma.user as unknown as { findMany: jest.Mock };
    userModel.findMany.mockResolvedValue([]);

    await service.getAlumni({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'STATE_ADMIN',
      sessionId: 'session-1',
      stateBaseCode: 'KNC',
    });

    expect(userModel.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { role: 'ALUMNI', stateBaseCode: 'KNC' },
    }));
  });

  it('builds overview counts without loading member profiles', async () => {
    const userModel = prisma.user as unknown as { groupBy: jest.Mock; findMany: jest.Mock };
    const reunionModel = prisma.reunionRegistration as unknown as { groupBy: jest.Mock };
    const contactModel = prisma.contactMessage as unknown as { groupBy: jest.Mock };
    userModel.groupBy.mockResolvedValue([
      { role: 'ALUMNI', stateBaseCode: 'KNC', stateBaseName: 'Kano Base', _count: { _all: 3 } },
      { role: 'AMBASSADOR', stateBaseCode: 'KNC', stateBaseName: 'Kano Base', _count: { _all: 2 } },
    ]);
    reunionModel.groupBy.mockResolvedValue([{ stateBaseCode: 'KNC', _count: { _all: 4 } }]);
    contactModel.groupBy.mockResolvedValue([{ stateBaseCode: 'KNC', _count: { _all: 5 } }]);

    await expect(service.getSummary({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'STATE_ADMIN',
      sessionId: 'session-1',
      stateBaseCode: 'KNC',
    })).resolves.toEqual({
      alumni: 3,
      ambassadors: 2,
      reunions: 4,
      messages: 5,
      bases: [{ code: 'KNC', name: 'Kano Base', alumni: 3, ambassadors: 2 }],
    });
    expect(userModel.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: { role: { in: ['ALUMNI', 'AMBASSADOR'] }, stateBaseCode: 'KNC' },
    }));
    expect(userModel.findMany).not.toHaveBeenCalled();
  });

  it('does not let state administrators approve members from another base', async () => {
    const userModel = prisma.user as unknown as { findUnique: jest.Mock; update: jest.Mock };
    userModel.findUnique.mockResolvedValue({ id: 'member-1', role: 'ALUMNI', stateBaseCode: 'LOS' });

    await expect(service.approveUser('member-1', 'alumni', {
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'STATE_ADMIN',
      sessionId: 'session-1',
      stateBaseCode: 'KNC',
    })).rejects.toThrow('Member not found');
    expect(userModel.update).not.toHaveBeenCalled();
  });

  it('rejects invalid state assignment when creating a state administrator', async () => {
    await expect(service.createAdmin({
      fullName: 'State Admin',
      email: 'state@example.com',
      password: 'password',
      role: 'STATE_ADMIN',
      stateBase: 'Not a State',
    }, {
      sub: 'root-1',
      email: 'root@example.com',
      role: 'SUPER_ADMIN',
      sessionId: 'session-1',
    })).rejects.toThrow('Select a valid state base');
  });
});
