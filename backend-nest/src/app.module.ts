import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { AlumniModule } from './alumni/alumni.module';
import { AmbassadorsModule } from './ambassadors/ambassadors.module';
import { ReunionModule } from './reunion/reunion.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';
import { ContactModule } from './contact/contact.module';
import { StorageModule } from './storage/storage.module';
import { GalleryModule } from './gallery/gallery.module';
import { PaymentsModule } from './payments/payments.module';
import { QueueModule } from './queues/queue.module';
import { RateLimitModule } from './common/rate-limit';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AlumniModule,
    AmbassadorsModule,
    ReunionModule,
    AdminModule,
    SupportModule,
    ContactModule,
    StorageModule,
    GalleryModule,
    PaymentsModule,
    QueueModule,
    RateLimitModule,
    LoggerModule.forRoot({ pinoHttp: { transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined } }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
