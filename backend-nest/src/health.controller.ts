import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'UP', database: 'UP', timestamp: new Date().toISOString() };
    } catch {
      this.logger.error('Database health check failed');
      throw new ServiceUnavailableException('Database health check failed');
    }
  }
}
