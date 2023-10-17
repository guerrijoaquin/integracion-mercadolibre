import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';

@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const api_key = this.config.getOrThrow('SIGNATURE_KEY');
    const request = context.switchToHttp().getRequest();
    try {
      request.body = verify(request.body.data, api_key);
      return true;
    } catch (e) {
      return false;
    }
  }
}
