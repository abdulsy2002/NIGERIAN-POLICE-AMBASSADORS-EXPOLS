import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { RespondTicketDto } from './dto/respond-ticket.dto';
import { getChapterReadScope, getChapterScope } from '../common/state-bases';
import { paginatedResult, Pagination } from '../common/pagination';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTicketDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { stateBaseCode: true } });
    if (!user) throw new NotFoundException('User not found');
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        stateBaseCode: user.stateBaseCode || 'NAT',
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority || 'medium',
        description: dto.description,
      },
      include: { responses: true },
    });
    return { success: true, data: ticket, message: 'Support ticket submitted successfully.' };
  }

  async findForUser(userId: string, pagination: Pagination) {
    const where = { userId };
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          _count: { select: { responses: true } },
          responses: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return paginatedResult(data, total, pagination);
  }

  async findAll(actor: { role: string; stateBaseCode?: string | null }, requestedCode: string | undefined, pagination: Pagination) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = scope ? { stateBaseCode: scope } : undefined;
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { email: true, fullName: true } },
          _count: { select: { responses: true } },
          responses: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return paginatedResult(
      data.map(({ user, ...ticket }) => ({
        ...ticket,
        userName: user.fullName,
        userEmail: user.email,
      })),
      total,
      pagination,
    );
  }

  private async ensureTicketScope(id: string, actor: { role: string; stateBaseCode?: string | null }) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    if (actor.role === 'STATE_ADMIN' && ticket.stateBaseCode !== getChapterScope(actor)) {
      throw new NotFoundException('Support ticket not found');
    }
    return ticket;
  }

  async respond(id: string, adminEmail: string, adminName: string, dto: RespondTicketDto, actor: { role: string; stateBaseCode?: string | null }) {
    await this.ensureTicketScope(id, actor);
    const updated = await this.prisma.$transaction(async (transaction) => {
      await transaction.supportTicketResponse.create({ data: { ticketId: id, adminEmail, adminName, message: dto.message } });
      return transaction.supportTicket.update({ where: { id }, data: { status: 'in-progress' }, include: { responses: true } });
    });
    return { success: true, data: updated, message: 'Response sent successfully.' };
  }

  async updateStatus(id: string, status: string, actor: { role: string; stateBaseCode?: string | null }) {
    const allowed = ['open', 'in-progress', 'resolved', 'closed'];
    if (!allowed.includes(status)) throw new NotFoundException('Invalid ticket status');
    await this.ensureTicketScope(id, actor);
    const ticket = await this.prisma.supportTicket.update({ where: { id }, data: { status, resolvedAt: status === 'resolved' ? new Date() : null }, include: { responses: true } });
    return { success: true, data: ticket };
  }
}
