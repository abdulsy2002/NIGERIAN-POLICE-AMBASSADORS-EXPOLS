import { BadRequestException, ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { RegisterReunionDto } from './dto/register-reunion.dto';
import { getChapterReadScope, getChapterScope, resolvePublicChapter } from '../common/state-bases';
import { getPagination, paginatedResult, Pagination } from '../common/pagination';

const DEFAULT_REUNION_SETTINGS = {
  heroBadge: '🎉 4TH ANNUAL REUNION',
  heroTitle: 'Reunion 2026',
  heroDescription: 'Join fellow alumni for our biggest gathering yet!',
  eventTitle: 'Event Details',
  eventSubtitle: '4th Annual EX-POLS Reunion',
  eventDate: 'December 12-14, 2026',
  eventVenue: 'Kano International Conference Centre\nZoo Road, Kano',
  eventTime: 'Friday 4PM - Sunday 2PM',
  expectedAttendance: '1,000+ Alumni & Guests',
  earlyBirdTitle: '🎟️ Early Bird Registration',
  earlyBirdDescription: 'Save 30% when you register before October 31, 2026',
  earlyBirdPrice: '₦15,000',
  earlyBirdLabel: 'Early Bird (Before Oct 31)',
  regularPrice: '₦20,000',
  regularLabel: 'Regular Registration',
  secureNote: '🔒 Secure payment • Refundable until Nov 30',
  scheduleTitle: 'Reunion Schedule',
  scheduleSubtitle: 'Three days of networking, celebration, and community service.',
  scheduleFriday: {
    date: 'Dec 12',
    items: [
      { time: '4:00 PM', title: 'Arrival & Accreditation', description: 'Registration check-in and welcome pack pickup' },
      { time: '6:30 PM', title: 'Welcome Cocktail & Networking', description: 'Meet and greet session with light refreshments' }
    ]
  },
  scheduleSaturday: {
    date: 'Dec 13',
    items: [
      { time: '9:00 AM', title: 'Main Assembly & Keynote', description: 'Address by national executives and keynote speech' },
      { time: '1:00 PM', title: 'Lunch & Group Photo', description: 'Networking lunch and official group photo session' },
      { time: '7:00 PM', title: 'Gala Night & Awards', description: 'Celebration dinner and award presentations' }
    ]
  },
  scheduleSunday: {
    date: 'Dec 14',
    items: [
      { time: '10:00 AM', title: 'Annual General Meeting', description: 'Constitutional affairs and chapter resolutions' },
      { time: '1:00 PM', title: 'Farewell & Departure', description: 'Closing remarks and departures' }
    ]
  },
  faqTitle: 'Questions?',
  faqSubtitle: 'Reunion FAQs',
  faqs: [
    { question: 'Who is eligible to attend?', answer: 'All registered EX-POLS alumni, ambassadors, and invited guests.' },
    { question: 'Is accommodation provided?', answer: 'Discounted hotel arrangements are available for registered attendees.' }
  ]
};

@Injectable()
export class ReunionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterReunionDto, userId?: string) {
    const stateBaseCode = await resolvePublicChapter(this.prisma, userId, dto.stateBaseCode);
    const email = dto.email.trim().toLowerCase();
    let paymentStatus = 'pending';
    let amountPaid: number | null = null;
    const paymentReference = dto.paymentReference?.trim();
    if (paymentReference) {
      const existing = await this.prisma.reunionRegistration.findUnique({ where: { paymentReference } });
      if (existing) throw new ConflictException('This payment reference has already been used');
      amountPaid = await this.getExpectedRegistrationAmount(stateBaseCode);
      if (dto.amountPaid !== amountPaid) {
        throw new BadRequestException('Payment amount does not match the reunion registration fee');
      }
      await this.verifyPayment(paymentReference, email, amountPaid);
      paymentStatus = 'paid';
    }

    const registration = await this.prisma.reunionRegistration.create({
      data: {
        ...dto,
        stateBaseCode,
        email,
        paymentReference: paymentReference || null,
        amountPaid,
        paymentStatus,
      },
    });
    return { success: true, data: registration, message: 'Reunion registration submitted successfully.' };
  }

  private async getExpectedRegistrationAmount(stateBaseCode: string): Promise<number> {
    const settings = await this.getSettings(stateBaseCode);
    const isEarlyBird = Date.now() < new Date('2026-11-01T00:00:00.000Z').getTime();
    const price = isEarlyBird ? settings.data.earlyBirdPrice : settings.data.regularPrice;
    const amount = Number(String(price).replace(/[^\d]/g, ''));
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new ServiceUnavailableException('Reunion registration pricing is not configured');
    }
    return amount;
  }

  private async verifyPayment(reference: string, email: string, amount: number): Promise<void> {
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) throw new ServiceUnavailableException('Paystack secret key is not configured');

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: 'Bearer ' + secret }, signal: AbortSignal.timeout(10_000) },
    );
    const result = await response.json() as {
      status?: boolean;
      data?: {
        reference?: string;
        status?: string;
        amount?: number;
        currency?: string;
        customer?: { email?: string };
      };
    };
    if (
      !response.ok ||
      result?.status !== true ||
      result?.data?.reference !== reference ||
      result?.data?.status !== 'success' ||
      result?.data?.amount !== amount * 100 ||
      result?.data?.currency !== 'NGN' ||
      result?.data?.customer?.email?.trim().toLowerCase() !== email
    ) {
      throw new BadRequestException('Paystack payment verification failed');
    }
  }

  async getRegistrations(
    actor: { role: string; stateBaseCode?: string | null },
    email?: string,
    requestedCode?: string,
    pagination: Pagination = getPagination(),
  ) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = {
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      ...(scope ? { stateBaseCode: scope } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.reunionRegistration.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take,
      }),
      this.prisma.reunionRegistration.count({ where }),
    ]);
    return paginatedResult(data, total, pagination);
  }

  async getSettings(stateBaseCode = 'NAT', userId?: string) {
    const scope = await resolvePublicChapter(this.prisma, userId, stateBaseCode);
    const saved = await this.prisma.reunionSettings.findUnique({ where: { id: scope } });
    const settings = saved?.settings;
    return { success: true, data: settings && typeof settings === 'object' && !Array.isArray(settings)
      ? { ...DEFAULT_REUNION_SETTINGS, ...settings as Record<string, unknown> }
      : { ...DEFAULT_REUNION_SETTINGS } };
  }

  async updateSettings(data: unknown, actor: { role: string; stateBaseCode?: string | null }, requestedCode?: string) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new BadRequestException('Settings must be an object');
    const scope = getChapterScope(actor, requestedCode);
    const current = (await this.getSettings(scope)).data;
    const settings = { ...current, ...data as Record<string, unknown> };
    await this.prisma.reunionSettings.upsert({
      where: { id: scope },
      create: { id: scope, settings },
      update: { settings },
    });
    return { success: true, data: settings, message: 'Reunion settings updated.' };
  }
}
