export interface MeliNotificationDto {
  _id: string;
  topic: string;
  resource: string;
  user_id: number;
  application_id: number;
  sent: Date;
  attempts: number;
  received: Date;
}
