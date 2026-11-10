import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';
import { getPagination } from '../common/pagination';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('validate')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 60, windowSeconds: 60 })
  @ApiOperation({ summary: 'Validate a member by identity number, email, phone, or name' })
  validateMember(@Query('query') query: string) {
    return this.authService.validateMember(query);
  }

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 20, windowSeconds: 60 })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/login')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 60 })
  @ApiOperation({ summary: 'Authenticate an administrator' })
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('refresh')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 60, windowSeconds: 60 })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request.user.sub);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 20, windowSeconds: 60 })
  updateMe(@Req() request: AuthenticatedRequest, @Body() body: any) {
    return this.authService.updateProfile(request.user.sub, body);
  }

  @Get('broadcasts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  broadcasts(
    @Req() request: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.authService.getBroadcasts(request.user.sub, getPagination(page, pageSize));
  }
}
