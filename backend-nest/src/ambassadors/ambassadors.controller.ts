import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AmbassadorsService } from './ambassadors.service';
import { RegisterAmbassadorDto } from './dto/register-ambassador.dto';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

@ApiTags('ambassadors')
@Controller('ambassadors')
export class AmbassadorsController {
  constructor(private readonly ambassadorsService: AmbassadorsService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  @ApiOperation({ summary: 'Register an ambassador profile' })
  register(@Body() dto: RegisterAmbassadorDto) {
    return this.ambassadorsService.register(dto);
  }
}
