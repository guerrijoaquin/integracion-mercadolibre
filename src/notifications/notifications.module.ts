import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MercadolibreModule } from 'src/mercadolibre/mercadolibre.module';
import { BullModule } from '@nestjs/bull';
import { NotificationsConsumer } from './notifications.consumer';
import { UsersModule } from 'src/users/users.module';
import { ChattinService } from 'src/common/services/chattin.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MercadolibreModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsConsumer, ChattinService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
