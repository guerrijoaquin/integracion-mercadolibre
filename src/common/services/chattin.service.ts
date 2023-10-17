import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChattinQuestion } from '../dtos/ChatAiQuestion.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChattinService {
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async askChatAi(data: ChattinQuestion) {
    const signed = this.signPayload(data);
    const { data: response } = await lastValueFrom(this.httpService.post('', data));
    return response;
  }

  private signPayload(payload: any) {
    return payload;
  }
}
