import { Body, Controller, ForbiddenException, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { AdminService } from '../admin/admin.service';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ReunionService } from './reunion.service';
import { RegisterReunionDto } from './dto/register-reunion.dto';
import { PrismaService } from '../prisma.service';
import { getPagination } from '../common/pagination';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

@ApiTags('reunion')
@Controller('reunion')
export class ReunionController {
  constructor(
    private readonly reunionService: ReunionService,
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  @ApiOperation({ summary: 'Register for a reunion' })
  register(@Body() dto: RegisterReunionDto, @Req() request: AuthenticatedRequest) {
    return this.reunionService.register(dto, request.user?.sub);
  }

  @Get('registrations')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get reunion registrations, optionally filtered by email' })
  async getRegistrations(
    @Req() request: AuthenticatedRequest,
    @Query('email') email?: string,
    @Query('stateBaseCode') stateBaseCode?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const account = await this.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { role: true, stateBaseCode: true, email: true },
    });
    if (!account) throw new ForbiddenException('User account not found');
    const actor = { ...request.user, role: account.role, stateBaseCode: account.stateBaseCode };
    const adminRoles = ['SUPER_ADMIN', 'NATIONAL_ADMIN', 'STATE_ADMIN'];
    const requestedEmail = adminRoles.includes(account.role) ? email : account.email;
    return this.reunionService.getRegistrations(actor, requestedEmail, stateBaseCode, getPagination(page, pageSize));
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get reunion settings' })
  @UseGuards(OptionalJwtAuthGuard)
  getSettings(@Query('stateBaseCode') stateBaseCode: string | undefined, @Req() request: AuthenticatedRequest) {
    return this.reunionService.getSettings(stateBaseCode || 'NAT', request.user?.sub);
  }

  @Post('settings')
  @ApiBearerAuth()
  @UseGuards(AdminRoleGuard)
  @ApiOperation({ summary: 'Update reunion settings' })
  async updateSettings(@Body() body: Record<string, unknown>, @Req() request: AuthenticatedRequest) {
    const { stateBaseCode, ...settings } = body;
    const result = await this.reunionService.updateSettings(settings, request.user, typeof stateBaseCode === 'string' ? stateBaseCode : undefined);
    await this.adminService.logAudit(request.user.email, 'UPDATE_REUNION_SETTINGS', {
      updatedFields: Object.keys(body ?? {}),
    }, request.user.sub);
    return result;
  }
}
