import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { GenerateMELITokenDTO } from './dtos/GenerateMELIToken.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entity/user.entity';
import { RefreshMELITokenDTO } from './dtos/RefreshMELIToken.dto';
import { ML_AUTH_REQUIRED } from 'src/common/constants/error-codes.constants';
import { MeliItemsPage } from './dtos/MeliItemsPage.interface';
import { MeliItem } from './dtos/MeliItem.interface';
import { sign } from 'jsonwebtoken';
import { FetchUserResourceDto } from './dtos/FetchUserRes.dto';
import { SendAnswerDto } from './dtos/SendAnswer.dto';
import { Response } from 'express';

@Injectable()
export class MercadolibreService {
  MELI_BASE_URL: string;
  MELI_AUTH_URL =
    'auth.mercadolibre.com.ar/authorization?response_type=code&client_id=1128712925782425&redirect_uri=http://localhost:3000/mercadolibre/auth&state=iddelusuario';
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private usersService: UsersService,
  ) {
    this.MELI_BASE_URL = this.config.get('MELI_BASE_URL');
  }

  async answerQuestion(data: SendAnswerDto, user: User) {
    const token = await this.getValidTokenForUser(user);
    const url = `${this.MELI_BASE_URL}/answers`;
    const { data: response } = await lastValueFrom(
      this.httpService.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    return response;
  }

  async fetchUserResource(resource: string, user_id: string): Promise<FetchUserResourceDto> {
    const user = await this.usersService.findUserByMLUserID(user_id);
    const token = await this.getValidTokenForUser(user);
    const url = `${this.MELI_BASE_URL}${resource}`;

    const { data } = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    return { data, user };
  }

  async getAllProducts(user: User) {
    try {
      const firstPage = await this.getProducts(user, 0);

      let total = firstPage.total;
      let offset = firstPage.limit;
      let limit = firstPage.limit;

      const pendingPages: Promise<MeliItemsPage>[] = [];
      while (offset < total) {
        pendingPages.push(this.getProducts(user, offset));
        offset += limit;
      }

      const pages = await Promise.all(pendingPages);

      const products: MeliItem[] = [];

      products.push(...firstPage.products);
      pages.forEach((page) => products.push(...page.products));

      return products;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProducts(user: User, offset: number): Promise<MeliItemsPage> {
    const token = await this.getValidTokenForUser(user);
    const seller_id = user.MLUserID;
    const url = `${this.MELI_BASE_URL}/sites/MLA/search?seller_id=${seller_id}&offset=${offset}`;
    const { data } = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    const page: MeliItemsPage = {
      total: data.paging.total,
      offset: data.paging.offset,
      limit: data.paging.limit,
      products: data.results,
    };

    return page;
  }

  async authAndLink(code: string, userId: string, res: Response) {
    const headers = {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    };

    const body: GenerateMELITokenDTO = {
      grant_type: 'authorization_code',
      code: code,
      client_id: this.config.get('MELI_CLIENT_ID'),
      client_secret: this.config.get('MELI_SECRET'),
      redirect_uri: this.config.get('MELI_REDIRECT_URI'),
    };

    try {
      const url = `${this.MELI_BASE_URL}/oauth/token`;
      let { data } = await lastValueFrom(this.httpService.post(url, body, { headers }));

      const MLUserID = data.user_id;
      const MLToken = data.access_token;
      const MLRefreshToken = data.refresh_token;

      const user = await this.usersService.create({
        userId,
        MLRefreshToken,
        MLToken,
        MLUserID,
      });

      const products = await this.getAllProducts(user);
      console.log('products', products);
      const secret = this.config.get('SIGNATURE_KEY');
      const signed = sign(JSON.stringify(products), secret);
      // Decode: const result = verify(signed, secret);

      //Send signed products to chattin

      //Redirect user to
      return 'check console!';
    } catch (error) {
      this.handleError(error);
    }
  }

  private async getValidTokenForUser(user: User): Promise<string | null> {
    let token;
    if (!this.isTokenExpired(user.MLTokenTimestamp)) token = user.MLToken;
    else if (!this.isRefreshTokenExpired(user.MLRefreshTokenTimestamp)) token = this.refreshToken(user);
    if (token) return await this.usersService.decodeString(token);
    throw new UnauthorizedException(`${ML_AUTH_REQUIRED}=${user.userId}`);
  }

  private async refreshToken(user: User) {
    const headers = {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    };

    const body: RefreshMELITokenDTO = {
      grant_type: 'refresh_token',
      client_id: this.config.get('MELI_CLIENT_ID'),
      client_secret: this.config.get('MELI_SECRET'),
      refresh_token: user.MLRefreshToken,
    };

    try {
      const url = `${this.MELI_BASE_URL}/oauth/token`;
      let { data } = await lastValueFrom(this.httpService.post(url, body, { headers }));

      this.usersService.updateByUserId(user.userId, {
        MLToken: data.access_token,
        MLRefreshToken: data.refresh_token,
      });

      return data.refresh_token;
    } catch (error) {
      this.handleError(error);
    }
  }

  private isTokenExpired(token_ts: Date): boolean {
    const now = new Date().getTime();
    const tokenExpires = new Date(token_ts).getTime() + 1000 * 60 * 60 * 6;
    //token expires is 6 hours
    return now > tokenExpires;
  }

  private isRefreshTokenExpired(refresh_token_ts: Date) {
    const now = new Date().getTime();
    const refreshTokenExpires = new Date(refresh_token_ts).getTime() + 1000 * 60 * 60 * 24 * 30 * 5;
    //refresh_token expires in 6 months
    return now > refreshTokenExpires;
  }

  private handleError(error) {
    if (error?.response?.data?.status === 400) throw new BadRequestException(error?.response?.data?.message);
    console.log(error);
    throw new InternalServerErrorException(error?.response?.data?.message);
  }
}
