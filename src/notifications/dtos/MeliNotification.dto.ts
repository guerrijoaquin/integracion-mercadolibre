import { TOPICS } from '../notifications.service';

export interface MeliNotificationDto {
  _id: string;
  topic: TOPICS;
  resource: string;
  user_id: number;
  application_id: number;
  sent: Date;
  attempts: number;
  received: Date;
}
