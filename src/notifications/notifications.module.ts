import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MercadolibreModule } from 'src/mercadolibre/mercadolibre.module';
import { ChatAiService } from 'src/common/services/chatai.service';

@Module({
  imports: [HttpModule, ConfigModule, MercadolibreModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, ChatAiService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
