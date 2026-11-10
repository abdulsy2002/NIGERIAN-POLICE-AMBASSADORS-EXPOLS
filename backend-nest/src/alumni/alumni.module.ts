import { Module } from '@nestjs/common';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AlumniController],
  providers: [AlumniService],
})
export class AlumniModule {}
