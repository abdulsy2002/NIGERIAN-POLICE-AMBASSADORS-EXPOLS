import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { RespondTicketDto } from './dto/respond-ticket.dto';
import { getPagination } from '../common/pagination';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

@ApiTags('support')
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreateTicketDto) {
    return this.supportService.create(request.user.sub, dto);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  findForUser(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.supportService.findForUser(request.user.sub, getPagination(page, pageSize));
  }

  @Get('admin/tickets')
  @UseGuards(AdminRoleGuard)
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.supportService.findAll(request.user, stateBaseCode, getPagination(page, pageSize));
  }

  @Post('admin/tickets/:id/respond')
  @UseGuards(AdminRoleGuard)
  respond(@Param('id') id: string, @Req() request: AuthenticatedRequest, @Body() dto: RespondTicketDto) {
    return this.supportService.respond(id, request.user.email, request.user.email, dto, request.user);
  }

  @Patch('admin/tickets/:id/status')
  @UseGuards(AdminRoleGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() request: AuthenticatedRequest) {
    return this.supportService.updateStatus(id, status, request.user);
  }
}
