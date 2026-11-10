import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../admin/admin.service';
import { PrismaService } from '../prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const payment = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  const queryRaw = jest.fn();
  const executeRaw = jest.fn();
  const logAudit = jest.fn();
  const prisma = {
    payment,
    $queryRaw: queryRaw,
    $executeRaw: executeRaw,
  } as unknown as PrismaService;
  const config = { get: jest.fn().mockReturnValue('paystack-secret') } as unknown as ConfigService;
  const adminService = { logAudit };
  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    queryRaw.mockResolvedValue([]);
    service = new PaymentsService(prisma, config, adminService as unknown as AdminService);
  });

  const dto = {
    expolIdNumber: 'NPAE/KNC/2026/0001',
    fullName: 'Test Member',
    email: ' MEMBER@EXAMPLE.COM ',
    phone: '08012345678',
    purpose: 'membership',
    amount: 1000,
  };

  it('provides enabled default payment purposes', async () => {
    const result = await service.getSettings();

    expect(result.data.purposes).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 'membership', enabled: true }),
    ]));
  });

  it('rejects amounts that do not match a fixed server-side price', async () => {
    queryRaw.mockResolvedValue([
      { purposes: [{ value: 'membership', label: 'Membership', amount: 5000, enabled: true, order: 1 }] },
    ]);

    await expect(service.initialize({ ...dto, amount: 1000 })).rejects.toBeInstanceOf(BadRequestException);
    expect(payment.create).not.toHaveBeenCalled();
  });

  it('rejects disabled purposes and invalid variable amounts', async () => {
    queryRaw.mockResolvedValue([
      { purposes: [
        { value: 'membership', label: 'Membership', amount: 0, enabled: false, order: 1 },
        { value: 'donation', label: 'Donation', amount: 0, enabled: true, order: 2 },
      ] },
    ]);

    await expect(service.initialize({ ...dto, purpose: 'membership' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.initialize({ ...dto, purpose: 'donation', amount: 150 })).rejects.toBeInstanceOf(BadRequestException);
    expect(payment.create).not.toHaveBeenCalled();
  });

  it('stores the amount and custom reason after validating the selected purpose', async () => {
    payment.create.mockResolvedValue({
      paystackReference: 'reference',
      amount: 1000,
      email: 'member@example.com',
      fullName: 'Test Member',
    });

    const result = await service.initialize({
      ...dto,
      purpose: 'other',
      customReason: '  Special contribution  ',
    });

    expect(payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 1000,
        email: 'member@example.com',
        customReason: 'Special contribution',
      }),
    });
    expect(result.data.amount).toBe(100000);
  });

  it('rejects invalid payment purpose settings before storing them', async () => {
    await expect(service.updateSettings([
      { value: 'duplicate', label: 'First', amount: 0, enabled: true, order: 1 },
      { value: 'duplicate', label: 'Second', amount: 0, enabled: true, order: 2 },
    ], 'admin@example.com', 'admin-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(executeRaw).not.toHaveBeenCalled();
  });

  it('audits valid payment settings changes with the authenticated administrator', async () => {
    const purposes = [{ value: 'membership', label: 'Membership', amount: 1000, enabled: true, order: 1 }];

    await service.updateSettings(purposes, 'admin@example.com', 'admin-1');

    expect(logAudit).toHaveBeenCalledWith(
      'admin@example.com',
      'UPDATE_PAYMENT_SETTINGS',
      {
        stateBaseCode: 'NAT',
        purposes: [{ value: 'membership', label: 'Membership', amount: 1000, enabled: true }],
      },
      'admin-1',
    );
  });

  it('returns a receipt only after Paystack verification and a successful database update', async () => {
    const paidPayment = {
      id: 'payment-1',
      amount: 1000,
      currency: 'NGN',
      email: 'member@example.com',
      expolIdNumber: 'NPAE/KNC/2026/0001',
      purpose: 'membership',
      paystackReference: 'reference',
    };
    payment.findUnique.mockResolvedValue(paidPayment);
    const receipt = {
      expolIdNumber: 'NPAE/KNC/2026/0001',
      fullName: 'Test Member',
      email: paidPayment.email,
      phone: '08012345678',
      purpose: 'membership',
      customReason: null,
      amount: paidPayment.amount,
      currency: paidPayment.currency,
      paystackReference: 'reference',
      paystackTransactionId: '12345',
      paymentDate: new Date('2026-11-08T20:00:00.000Z'),
      status: 'success',
    };
    payment.update.mockResolvedValue(receipt);
    logAudit.mockResolvedValue({});
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          reference: 'reference',
          status: 'success',
          amount: 100000,
          currency: 'NGN',
          customer: { email: paidPayment.email },
          id: 12345,
        },
      }),
    } as Response);

    try {
      const result = await service.verify('reference');

      expect(result).toEqual({
        success: true,
        message: 'Payment verified successfully!',
        receipt,
      });
      expect(payment.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: paidPayment.id },
        data: expect.objectContaining({ status: 'success', paystackTransactionId: '12345' }),
        select: expect.objectContaining({ paystackReference: true, paymentDate: true }),
      }));
      expect(logAudit).toHaveBeenCalledWith(
        paidPayment.email,
        'CONFIRM_PAYMENT',
        expect.objectContaining({ reference: 'reference', transactionId: '12345' }),
      );
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
