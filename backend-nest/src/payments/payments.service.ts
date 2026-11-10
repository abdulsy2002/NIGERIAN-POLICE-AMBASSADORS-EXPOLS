import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { AdminService } from '../admin/admin.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { randomBytes } from 'node:crypto';
import { getChapterReadScope, getChapterScope, resolvePublicChapter } from '../common/state-bases';
import { paginatedResult, Pagination } from '../common/pagination';

export interface PaymentPurpose {
  value: string;
  label: string;
  amount: number;
  enabled: boolean;
  order: number;
}

const DEFAULT_PAYMENT_PURPOSES: PaymentPurpose[] = [
  { value: 'reunion', label: 'Reunion Registration Fee', amount: 0, enabled: true, order: 1 },
  { value: 'id-card', label: 'ID Card', amount: 0, enabled: true, order: 2 },
  { value: 'membership', label: 'Membership Fee', amount: 0, enabled: true, order: 3 },
  { value: 'donation', label: 'Donation', amount: 0, enabled: true, order: 4 },
  { value: 'other', label: 'Other', amount: 0, enabled: true, order: 5 },
];

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly adminService: AdminService,
  ) {}

  async getSettings(stateBaseCode = 'NAT', userId?: string) {
    const scope = await resolvePublicChapter(this.prisma, userId, stateBaseCode);
    const settings = await this.prisma.$queryRaw<Array<{ purposes: unknown }>>`
      SELECT "purposes" FROM "PaymentSettings" WHERE "id" = ${scope} LIMIT 1
    `;
    const purposes = settings.length > 0
      ? this.validatePurposes(settings[0].purposes, true)
      : DEFAULT_PAYMENT_PURPOSES;
    return { success: true, data: { purposes } };
  }

  async updateSettings(
    input: unknown,
    actorEmail: string,
    actorId: string,
    actor: { role: string; stateBaseCode?: string | null } = { role: 'NATIONAL_ADMIN' },
    requestedCode?: string,
  ) {
    const scope = getChapterScope(actor, requestedCode);
    const purposes = this.validatePurposes(input);
    await this.prisma.$executeRaw`
      INSERT INTO "PaymentSettings" ("id", "purposes", "updatedAt")
      VALUES (${scope}, ${JSON.stringify(purposes)}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO UPDATE
      SET "purposes" = EXCLUDED."purposes", "updatedAt" = CURRENT_TIMESTAMP
    `;
    await this.adminService.logAudit(actorEmail, 'UPDATE_PAYMENT_SETTINGS', {
      stateBaseCode: scope,
      purposes: purposes.map(({ value, label, amount, enabled }) => ({ value, label, amount, enabled })),
    }, actorId);
    return { success: true, data: { purposes } };
  }

  async getAll(actor: { role: string; stateBaseCode?: string | null }, requestedCode: string | undefined, pagination: Pagination) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = scope ? { stateBaseCode: scope } : undefined;
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      this.prisma.payment.count({ where }),
    ]);
    return paginatedResult(data, total, pagination);
  }

  async initialize(dto: InitializePaymentDto, userId?: string) {
    const stateBaseCode = await resolvePublicChapter(this.prisma, userId, dto.stateBaseCode);
    const { purposes } = (await this.getSettings(stateBaseCode)).data;
    const selectedPurpose = purposes.find((purpose) => purpose.value === dto.purpose && purpose.enabled);
    if (!selectedPurpose) throw new BadRequestException('Select an available payment purpose');
    if (selectedPurpose.value === 'other' && !dto.customReason?.trim()) {
      throw new BadRequestException('Please specify the reason for this payment');
    }

    const amount = Number(dto.amount);
    if (!Number.isSafeInteger(amount) || amount < 100 || amount % 100 !== 0) {
      throw new BadRequestException('Amount must be at least ₦100 and in ₦100 increments');
    }
    if (selectedPurpose.amount > 0 && amount !== selectedPurpose.amount) {
      throw new BadRequestException(`The amount for ${selectedPurpose.label} must be ₦${selectedPurpose.amount.toLocaleString('en-NG')}`);
    }

    const reference = `T${Date.now()}${randomBytes(3).toString('hex')}`;
    const payment = await this.prisma.payment.create({
      data: {
        ...dto,
        stateBaseCode,
        amount,
        email: dto.email.trim().toLowerCase(),
        paystackReference: reference,
        customReason: dto.purpose === 'other' ? dto.customReason?.trim() : null,
      },
    });
    return { success: true, data: { reference: payment.paystackReference, amount: payment.amount * 100, email: payment.email, fullName: payment.fullName } };
  }

  private validatePurposes(input: unknown, fromDatabase = false): PaymentPurpose[] {
    const fail = (): never => {
      if (fromDatabase) throw new InternalServerErrorException('Stored payment purpose settings are invalid');
      throw new BadRequestException('Payment purposes must be a valid list of configured options');
    };
    if (!Array.isArray(input) || input.length === 0 || input.length > 50) return fail();

    const purposes: PaymentPurpose[] = [];
    const values = new Set<string>();
    for (const item of input) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return fail();
      const purpose = item as Record<string, unknown>;
      if (
        typeof purpose.value !== 'string' ||
        !/^[a-z0-9][a-z0-9-]{0,49}$/.test(purpose.value) ||
        values.has(purpose.value) ||
        typeof purpose.label !== 'string' ||
        !purpose.label.trim() ||
        purpose.label.trim().length > 120 ||
        typeof purpose.amount !== 'number' ||
        !Number.isSafeInteger(purpose.amount) ||
        (purpose.amount !== 0 && (purpose.amount < 100 || purpose.amount % 100 !== 0)) ||
        typeof purpose.enabled !== 'boolean' ||
        typeof purpose.order !== 'number' ||
        !Number.isSafeInteger(purpose.order) ||
        purpose.order < 1
      ) {
        return fail();
      }
      values.add(purpose.value);
      purposes.push({
        value: purpose.value,
        label: purpose.label.trim(),
        amount: purpose.amount,
        enabled: purpose.enabled,
        order: purpose.order,
      });
    }
    if (!purposes.some((purpose) => purpose.enabled)) return fail();
    return purposes.sort((a, b) => a.order - b.order);
  }

  async verify(reference: string) {
    const payment = await this.prisma.payment.findUnique({ where: { paystackReference: reference } });
    if (!payment) throw new NotFoundException('Payment not found');
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) throw new ServiceUnavailableException('Paystack secret key is not configured');

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(10_000) },
    );
    const result = await response.json() as {
      status?: boolean;
      data?: {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
        customer?: { email?: string };
        id?: string | number;
      };
    };
    if (
      !response.ok ||
      result?.status !== true ||
      result?.data?.reference !== reference ||
      result?.data?.status !== 'success' ||
      result?.data?.amount !== payment.amount * 100 ||
      result?.data?.currency !== payment.currency ||
      result?.data?.customer?.email?.trim().toLowerCase() !== payment.email ||
      result?.data?.id == null
    ) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'failed' } });
      throw new BadRequestException('Paystack payment verification failed');
    }

    const verifiedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'success',
        paystackTransactionId: String(result.data.id),
        paymentDate: new Date(),
      },
      select: {
        stateBaseCode: true,
        expolIdNumber: true,
        fullName: true,
        email: true,
        phone: true,
        purpose: true,
        customReason: true,
        amount: true,
        currency: true,
        paystackReference: true,
        paystackTransactionId: true,
        paymentDate: true,
        status: true,
      },
    });
    await this.adminService.logAudit(payment.email, 'CONFIRM_PAYMENT', {
      reference: payment.paystackReference,
      transactionId: String(result.data.id),
      amount: payment.amount,
      currency: payment.currency,
      purpose: payment.purpose,
      expolIdNumber: payment.expolIdNumber,
    });
    return {
      success: true,
      message: 'Payment verified successfully!',
      receipt: verifiedPayment,
    };
  }
}
