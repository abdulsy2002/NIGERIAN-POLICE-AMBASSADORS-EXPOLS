import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryService } from './gallery.service';
import { getPagination } from '../common/pagination';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query('stateBaseCode') stateBaseCode: string | undefined,
    @Query('page') page: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.galleryService.findAll(stateBaseCode || 'NAT', request.user?.sub, getPagination(page, pageSize));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  create(@Body() dto: CreateGalleryDto, @Req() request: AuthenticatedRequest) { return this.galleryService.create(dto, request.user.email, request.user); }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  update(@Param('id') id: string, @Body() dto: UpdateGalleryDto, @Req() request: AuthenticatedRequest) { return this.galleryService.update(id, dto, request.user); }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return this.galleryService.remove(id, request.user); }
}
