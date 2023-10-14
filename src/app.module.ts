import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MercadolibreModule } from './mercadolibre/mercadolibre.module';
import { UsersModule } from './users/users.module';
import { HttpModule } from '@nestjs/axios';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    MercadolibreModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
