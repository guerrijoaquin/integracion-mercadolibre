import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChattinQuestion } from '../dtos/ChatAiQuestion.dto';
import { lastValueFrom } from 'rxjs';
import { sign } from 'jsonwebtoken';
import { ChattinSignupDto } from '../dtos/ChattinSignup.dto';
import { SignUpOrUpdateChattin } from '../dtos/SignUpOrUpdateChattin';
import { AccountActions } from 'src/users/users.service';

@Injectable()
export class ChattinService {
  private CHATTIN_API_URL: string;
  private SIGNATURE_KEY: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.CHATTIN_API_URL = config.get('CHATTIN_API_URL');
    this.SIGNATURE_KEY = config.get('SIGNATURE_KEY');
  }

  async signUpOrUpdate({ data, action }: SignUpOrUpdateChattin) {
    if (action === AccountActions.CREATE) return this.signUpUser(data);
    return this.updateUser(data);
  }

  async signUpUser(data: ChattinSignupDto) {
    const payload = {
      data: this.signPayload(data),
    };
    const {
      data: { response },
    } = await lastValueFrom(this.httpService.post(`${this.CHATTIN_API_URL}/v1/mercado-libre/create-website`, payload));
    return response;
  }

  async updateUser(data: ChattinSignupDto) {
    const payload = {
      data: this.signPayload(data),
    };
    const {
      data: { response },
    } = await lastValueFrom(this.httpService.post(`${this.CHATTIN_API_URL}/v1/mercado-libre/edit-website`, payload));
    return response;
  }

  async askChatAi(data: ChattinQuestion) {
    const payload = {
      data: this.signPayload(data),
    };
    const {
      data: { response },
    } = await lastValueFrom(this.httpService.post(`${this.CHATTIN_API_URL}/v1/mercado-libre/create-website`, payload));
    return response;
  }

  private signPayload = (payload: any) => sign(JSON.stringify(payload), this.SIGNATURE_KEY);
  // Decode: const result = verify(signed, secret);
}
