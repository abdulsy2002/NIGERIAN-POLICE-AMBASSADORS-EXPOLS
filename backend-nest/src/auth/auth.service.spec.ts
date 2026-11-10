import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
jest.mock('@nestjs/jwt', () => ({ JwtService: class {} }));
import { AuthService } from './auth.service';

const user = {
  id: 'user-1',
  email: 'member@example.com',
  passwordHash: 'argon2-hash',
  fullName: 'Test Member',
  role: 'ALUMNI',
};

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  } as any;
  const jwtService = { signAsync: jest.fn() } as any;
  const mail = { sendRegistrationReceivedEmail: jest.fn() } as any;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma, jwtService, mail);
    jwtService.signAsync.mockResolvedValue('access-token');
    prisma.refreshSession.create.mockResolvedValue({});
    mail.sendRegistrationReceivedEmail.mockResolvedValue(true);
  });

  it('registers a user and creates a refresh session', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);

    const result = await service.register({
      email: ' Member@Example.com ',
      password: 'password123',
      fullName: ' Test Member ',
      userType: 'ALUMNI',
    });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: 'member@example.com', fullName: 'Test Member', role: 'ALUMNI' }),
    });
    expect(prisma.refreshSession.create).toHaveBeenCalledTimes(1);
    expect(mail.sendRegistrationReceivedEmail).toHaveBeenCalledWith({
      to: 'member@example.com',
      fullName: 'Test Member',
      memberType: 'alumni',
    });
    expect(result.emailSent).toBe(true);
  });

  it('rejects administrative roles during public registration', async () => {
    await expect(service.register({
      email: 'admin@example.com',
      password: 'password123',
      userType: 'SUPER_ADMIN',
    } as any)).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate email registration', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.register({
      email: 'member@example.com',
      password: 'password123',
      fullName: 'Test Member',
      userType: 'ALUMNI',
    })).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login({ email: 'unknown@example.com', password: 'password123' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates a valid refresh session', async () => {
    prisma.refreshSession.findUnique.mockResolvedValue({
      id: 'session-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user,
    });

    const result = await service.refresh({ refreshToken: 'refresh-token-value-1234567890' });

    expect(result.success).toBe(true);
    expect(prisma.refreshSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.refreshSession.create).toHaveBeenCalledTimes(1);
  });

  it('revokes a refresh session on logout', async () => {
    await expect(service.logout('refresh-token-value-1234567890')).resolves.toEqual({ success: true });
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
      where: { tokenHash: expect.any(String), revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('saves immediate profile changes and creates an admin approval request in one transaction', async () => {
    const tx = {
      user: {
        findUnique: jest.fn()
          .mockResolvedValueOnce({ id: 'user-1', role: 'ALUMNI' })
          .mockResolvedValueOnce({ id: 'user-1', email: 'member@example.com', fullName: 'Test Member' }),
        update: jest.fn().mockResolvedValue({}),
      },
      profileUpdateRequest: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'request-1' }),
      },
      alumniProfile: { upsert: jest.fn() },
      ambassadorProfile: { upsert: jest.fn() },
    };
    prisma.$transaction = jest.fn((callback: (client: any) => Promise<any>) => callback(tx));

    const result = await service.updateProfile('user-1', {
      phoneNumber: '08012345678',
      requestedChanges: { fullName: 'Updated Member' },
    });

    expect(result.message).toContain('submitted for admin approval');
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { phoneNumber: '08012345678' },
    });
    expect(tx.profileUpdateRequest.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', requestedChanges: { fullName: 'Updated Member' } },
    });
  });

  it('does not allow approval-only profile fields to be changed directly', async () => {
    await expect(service.updateProfile('user-1', { fullName: 'Unapproved Change' } as any))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
