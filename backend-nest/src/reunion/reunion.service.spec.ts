import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { ReunionService } from './reunion.service';

describe('ReunionService', () => {
  const reunionRegistration = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const reunionSettings = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  };
  const prisma = {
    reunionRegistration,
    reunionSettings,
  } as unknown as PrismaService;
  const config = {
    get: jest.fn().mockReturnValue('paystack-secret'),
  } as unknown as ConfigService;
  let service: ReunionService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-11-08T12:00:00.000Z').getTime());
    service = new ReunionService(prisma, config);
    reunionRegistration.findUnique.mockResolvedValue(null);
    reunionSettings.findUnique.mockResolvedValue(null);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const registration = {
    fullName: 'Test Member',
    email: 'member@example.com',
    phone: '08012345678',
    school: 'EX-POLS',
    graduationYear: 2000,
    attendanceType: 'alumni',
    paymentReference: 'paystack-reference',
    amountPaid: 20000,
  };

  it('does not mark a registration paid for a fabricated reference', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ status: false, data: { status: 'failed' } }),
    } as Response);

    await expect(service.register(registration)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.reunionRegistration.create).not.toHaveBeenCalled();
  });

  it('marks a registration paid only after matching Paystack verification', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          reference: registration.paymentReference,
          status: 'success',
          amount: 2000000,
          currency: 'NGN',
          customer: { email: registration.email },
        },
      }),
    } as Response);
    reunionRegistration.create.mockResolvedValue({ id: 'registration-1' });

    await service.register(registration);

    expect(reunionRegistration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentStatus: 'paid',
        paymentReference: registration.paymentReference,
        amountPaid: 20000,
      }),
    });
  });
});
