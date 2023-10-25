import { Body, Controller, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Response } from 'express';
import { RealIP } from 'nestjs-real-ip';

@Controller('notifications')
export class NotificationsController {
  private MELI_IPS = ['54.88.218.97', '18.215.140.160', '18.213.114.129', '18.206.34.84'];
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async receiveNotification(@RealIP() ip: string, @Body() payload, @Res() res: Response) {
    // if (!this.MELI_IPS.includes(ip)) throw new UnauthorizedException(`Unknow IP: ${ip}`);
    await this.notificationsService.handleNotification(payload);
    return res.status(200).send('Ok');
  }
}
