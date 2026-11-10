import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRoleGuard } from './admin-role.guard';
import { NationalAdminGuard } from './national-admin.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRoleGuard, NationalAdminGuard, SuperAdminGuard],
  exports: [AdminRoleGuard, NationalAdminGuard, SuperAdminGuard, AdminService],
})
export class AdminModule {}
