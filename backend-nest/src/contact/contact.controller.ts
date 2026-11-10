import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { getPagination } from '../common/pagination';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('messages')
  @UseGuards(OptionalJwtAuthGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  create(@Body() dto: CreateContactMessageDto, @Req() request: AuthenticatedRequest) {
    return this.contactService.create(dto, request.user?.sub);
  }

  @Get('admin/messages')
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.contactService.findAll(request.user, stateBaseCode, getPagination(page, pageSize));
  }
}
