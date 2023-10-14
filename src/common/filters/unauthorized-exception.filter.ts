import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ML_AUTH_REQUIRED } from '../constants/error-codes.constants';
import { MeliCredentialsInterface } from 'src/mercadolibre/dtos/MeliCredentials.interface';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  constructor(private meliCredentials: MeliCredentialsInterface) {}
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (exception.message.startsWith(ML_AUTH_REQUIRED)) {
      const userId = exception.message.substring(exception.message.indexOf('=') + 1);
      return response.redirect(this.getMeliAuthUrl(userId));
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getMeliAuthUrl = (userId): string =>
    `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${this.meliCredentials.MELICLIENTID}&redirect_uri=${this.meliCredentials.MELIREDIRECTURI}&state=${userId}`;
}
