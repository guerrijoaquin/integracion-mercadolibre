import { Body, Controller, Post, Res } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Response } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  receiveNotification(@Body() payload, @Res() res: Response) {
    res.status(200).send('Ok');
    this.notificationsService.handleNotification(payload);
  }
}
