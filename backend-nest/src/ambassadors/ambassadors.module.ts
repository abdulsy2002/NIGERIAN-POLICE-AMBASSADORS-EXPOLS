import { Module } from '@nestjs/common';
import { AmbassadorsController } from './ambassadors.controller';
import { AmbassadorsService } from './ambassadors.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AmbassadorsController],
  providers: [AmbassadorsService],
})
export class AmbassadorsModule {}
