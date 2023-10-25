import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MeliNotificationDto } from './dtos/MeliNotification.dto';
import { ConfigService } from '@nestjs/config';
import { MercadolibreService } from 'src/mercadolibre/mercadolibre.service';
import { ChattinService } from 'src/common/services/chattin.service';
import { NotificationDataDto } from './dtos/NotificationData.dto';

export enum TOPICS {
  QUESTIONS = 'questions',
  ORDERS_CREATED = 'created_orders',
  ORDERS = 'orders',
  ITEMS = 'items',
}

@Processor('notifications')
export class NotificationsConsumer {
  private MAX_RETRIES: number;
  private RETRY_INTERVAL_MS: number;
  constructor(
    private readonly config: ConfigService,
    private readonly mercadolibreService: MercadolibreService,
    private readonly chattinService: ChattinService,
  ) {
    this.MAX_RETRIES = this.config.get('MAX_RETRIES');
    this.RETRY_INTERVAL_MS = this.config.get('RETRY_INTERVAL_MS');
  }

  @Process('new')
  async handleNotification({ data: { topic, resource, user_id } }: Job<MeliNotificationDto>) {
    console.log(`Handling queue event ${resource} for user ${user_id}`);
    switch (topic) {
      case TOPICS.QUESTIONS:
        return this.handleQuestion({ resource, user_id });
      case TOPICS.ITEMS:
        return this.handleItems({ resource, user_id });
      case TOPICS.ORDERS_CREATED:
        return this.handleOrders({ resource, user_id });
      case TOPICS.ORDERS:
        return this.handleOrders({ resource, user_id });
      default:
        return console.error(`Unsupported topic: ${topic}`);
    }
  }

  async handleOrders({ resource, user_id }: NotificationDataDto) {
    let attemp = 0;
    while (attemp <= this.MAX_RETRIES) {
      attemp++;
      try {
        const { data, user } = await this.mercadolibreService.fetchUserResource(resource, String(user_id));

        console.log('VENTA NUEVA!');

        break;
      } catch (error) {
        const errorMessage = error?.response?.data?.error;
        const excludeErrors = ['forbidden', 'not_found'];
        if (excludeErrors.includes(errorMessage)) break;
        if (attemp <= this.MAX_RETRIES) await new Promise((resolve) => setTimeout(resolve, this.RETRY_INTERVAL_MS));
        else {
          console.error(`Could not perfom handleItems after ${attemp} attemps`);
          console.error(`On resource: ${resource}`);
          console.error(`Exiting with error: ${error}`);
        }
      }
    }
  }

  async handleItems({ resource, user_id }: NotificationDataDto) {
    let attemp = 0;
    while (attemp <= this.MAX_RETRIES) {
      attemp++;
      try {
        const { data, user } = await this.mercadolibreService.fetchUserResource(resource, String(user_id));

        console.log('Cambio en item!');

        break;
      } catch (error) {
        const errorMessage = error?.response?.data?.error;
        const excludeErrors = ['forbidden', 'not_found'];
        if (excludeErrors.includes(errorMessage)) break;
        if (attemp <= this.MAX_RETRIES) await new Promise((resolve) => setTimeout(resolve, this.RETRY_INTERVAL_MS));
        else {
          console.error(`Could not perfom handleItems after ${attemp} attemps`);
          console.error(`On resource: ${resource}`);
          console.error(`Exiting with error: ${error}`);
        }
      }
    }
  }

  async handleQuestion({ resource, user_id }: NotificationDataDto) {
    let attemp = 0;
    while (attemp <= this.MAX_RETRIES) {
      attemp++;
      try {
        const { data, user } = await this.mercadolibreService.fetchUserResource(resource, String(user_id));

        if (data?.answer?.text) break;

        const questionId = data.id;
        const question = data.text;

        console.log('PREGUNTA!', question);

        const response = await this.chattinService.askChatAi({
          question,
          userId: user.userId,
          MLUserId: user.MLUserID,
        });

        console.log('respuesta de chattin', response);

        await this.mercadolibreService.answerQuestion(
          {
            question_id: questionId,
            text: response,
          },
          user,
        );

        break;
      } catch (error) {
        const errorMessage = error?.response?.data?.error;
        const excludeErrors = ['not_unanswered_question', 'forbidden', 'not_found'];
        if (excludeErrors.includes(errorMessage)) break;
        if (attemp <= this.MAX_RETRIES) await new Promise((resolve) => setTimeout(resolve, this.RETRY_INTERVAL_MS));
        else {
          console.error(`Could not perfom handleQuestion after ${attemp} attemps`);
          console.error(`On resource: ${resource}`);
          console.error(`Exiting with error: ${error}`);
        }
      }
    }
  }
}
