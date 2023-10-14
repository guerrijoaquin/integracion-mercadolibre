import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatAiQuestion } from '../dtos/ChatAiQuestion.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatAiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async askChatAi(data: ChatAiQuestion) {
    const signed = this.signPayload(data);
    const { data: response } = await lastValueFrom(this.httpService.post('', data));
    return response;
  }

  private signPayload(payload: any) {
    return payload;
  }
}
