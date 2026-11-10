import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    ConfigModule,
    AdminModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
