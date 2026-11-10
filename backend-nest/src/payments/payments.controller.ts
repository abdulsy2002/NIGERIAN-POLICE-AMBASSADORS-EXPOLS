import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentsService } from './payments.service';
import { getPagination } from '../common/pagination';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'List all payments (admin)' })
  getAll(
    @Req() request: AuthenticatedRequest,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.paymentsService.getAll(request.user, stateBaseCode, getPagination(page, pageSize));
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get enabled payment purposes and amounts' })
  @UseGuards(OptionalJwtAuthGuard)
  getSettings(@Query('stateBaseCode') stateBaseCode: string | undefined, @Req() request: AuthenticatedRequest) {
    return this.paymentsService.getSettings(stateBaseCode || 'NAT', request.user?.sub);
  }

  @Put('settings')
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Update payment purposes and amounts (admin)' })
  updateSettings(@Body('purposes') purposes: unknown, @Body('stateBaseCode') stateBaseCode: string | undefined, @Req() request: AuthenticatedRequest) {
    return this.paymentsService.updateSettings(purposes, request.user.email, request.user.sub, request.user, stateBaseCode);
  }

  @Post('initialize')
  @UseGuards(OptionalJwtAuthGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 600 })
  @ApiOperation({ summary: 'Create a pending Paystack payment' })
  initialize(@Body() dto: InitializePaymentDto, @Req() request: AuthenticatedRequest) { return this.paymentsService.initialize(dto, request.user?.sub); }

  @Get('verify/:reference')
  @ApiOperation({ summary: 'Verify a Paystack payment server-side' })
  verify(@Param('reference') reference: string) { return this.paymentsService.verify(reference); }
}
