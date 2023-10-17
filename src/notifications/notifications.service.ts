import { Injectable } from '@nestjs/common';
import { MeliNotificationDto } from './dtos/MeliNotification.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications')
    private notificationsQueue: Queue,
  ) {}

  async handleNotification(data: MeliNotificationDto) {
    if (data.attempts > 1) return;
    return await this.notificationsQueue.add('new', data);
  }
}
