import { Module } from '@nestjs/common';
import { MercadolibreService } from './mercadolibre.service';
import { MercadolibreController } from './mercadolibre.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { ChattinService } from 'src/common/services/chattin.service';

@Module({
  imports: [HttpModule, ConfigModule, UsersModule],
  controllers: [MercadolibreController],
  providers: [MercadolibreService, ChattinService],
  exports: [MercadolibreService],
})
export class MercadolibreModule {}
