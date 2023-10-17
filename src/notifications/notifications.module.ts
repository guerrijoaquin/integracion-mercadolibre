import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MercadolibreModule } from 'src/mercadolibre/mercadolibre.module';
import { ChatAiService } from 'src/common/services/chatai.service';
import { BullModule } from '@nestjs/bull';
import { NotificationsConsumer } from './notifications.consumer';
import { UsersModule } from 'src/users/users.module';

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
  providers: [NotificationsService, NotificationsConsumer, ChatAiService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
