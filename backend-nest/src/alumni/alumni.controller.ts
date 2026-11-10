import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlumniService } from './alumni.service';
import { RegisterAlumniDto } from './dto/register-alumni.dto';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

@ApiTags('alumni')
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  @ApiOperation({ summary: 'Register an alumni profile' })
  register(@Body() dto: RegisterAlumniDto) {
    return this.alumniService.register(dto);
  }
}
