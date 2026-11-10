import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3StorageService } from '../storage/s3-storage.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { getChapterScope, resolvePublicChapter } from '../common/state-bases';
import { paginatedResult, Pagination } from '../common/pagination';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService, private readonly storage: S3StorageService) {}

  async findAll(stateBaseCode = 'NAT', userId: string | undefined, pagination: Pagination) {
    let scope: string | undefined;
    if (stateBaseCode.toUpperCase() === 'ALL') {
      if (!userId) throw new BadRequestException('Administrator access is required to view every chapter');
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (!user || !['SUPER_ADMIN', 'NATIONAL_ADMIN'].includes(user.role)) {
        scope = await resolvePublicChapter(this.prisma, userId, stateBaseCode);
      }
    } else {
      scope = await resolvePublicChapter(this.prisma, userId, stateBaseCode);
    }
    const where = scope ? { stateBaseCode: scope } : undefined;
    const [images, total] = await Promise.all([
      this.prisma.galleryImage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: pagination.skip, take: pagination.take }),
      this.prisma.galleryImage.count({ where }),
    ]);
    const data = await Promise.all(images.map(async image => ({ ...image, imageUrl: await this.storage.signedUrl(image.imageKey) })));
    return paginatedResult(data, total, pagination);
  }

  async create(dto: CreateGalleryDto, uploadedBy: string, actor: { role: string; stateBaseCode?: string | null }) {
    const scope = getChapterScope(actor, dto.stateBaseCode);
    const imageKey = await this.storage.uploadBase64(dto.image, 'gallery');
    const image = await this.prisma.galleryImage.create({ data: { title: dto.title, description: dto.description, category: dto.category || 'General', imageKey, uploadedBy, stateBaseCode: scope } });
    return { success: true, data: { ...image, imageUrl: await this.storage.signedUrl(image.imageKey) }, message: 'Image uploaded successfully.' };
  }

  private async findScopedImage(id: string, actor: { role: string; stateBaseCode?: string | null }) {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image || (actor.role === 'STATE_ADMIN' && image.stateBaseCode !== getChapterScope(actor))) {
      throw new NotFoundException('Gallery image not found');
    }
    return image;
  }

  async update(id: string, dto: UpdateGalleryDto, actor: { role: string; stateBaseCode?: string | null }) {
    await this.findScopedImage(id, actor);
    const image = await this.prisma.galleryImage.update({ where: { id }, data: dto });
    return { success: true, data: { ...image, imageUrl: await this.storage.signedUrl(image.imageKey) }, message: 'Image updated successfully.' };
  }

  async remove(id: string, actor: { role: string; stateBaseCode?: string | null }) {
    const image = await this.findScopedImage(id, actor);
    await this.storage.delete(image.imageKey);
    await this.prisma.galleryImage.delete({ where: { id } });
    return { success: true, message: 'Image deleted successfully.' };
  }
}
