import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { ReunionController } from './reunion.controller';
import { ReunionService } from './reunion.service';

@Module({
  imports: [AuthModule, AdminModule],
  controllers: [ReunionController],
  providers: [ReunionService],
})
export class ReunionModule {}
