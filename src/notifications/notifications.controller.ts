import { Body, Controller, Post, Res } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Response } from 'express';
import { RealIP } from 'nestjs-real-ip';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async receiveNotification(@RealIP() ip: string, @Body() payload, @Res() res: Response) {
    console.log('Notification from IP: ', ip);
    await this.notificationsService.handleNotification(payload);
    return res.status(200).send('Ok');
  }
}
