import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { getChapterReadScope, resolvePublicChapter } from '../common/state-bases';
import { paginatedResult, Pagination } from '../common/pagination';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactMessageDto, userId?: string) {
    const stateBaseCode = await resolvePublicChapter(this.prisma, userId, dto.stateBaseCode);
    const message = await this.prisma.contactMessage.create({
      data: { stateBaseCode, name: dto.name.trim(), email: dto.email.trim().toLowerCase(), subject: dto.subject?.trim(), message: dto.message.trim() },
    });
    return { success: true, data: message, message: 'Message received. We will get back to you soon!' };
  }

  async findAll(actor: { role: string; stateBaseCode?: string | null }, requestedCode: string | undefined, pagination: Pagination) {
    const scope = getChapterReadScope(actor, requestedCode);
    const where = scope ? { stateBaseCode: scope } : undefined;
    const [data, total] = await Promise.all([
      this.prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return paginatedResult(data, total, pagination);
  }
}
