import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { getClientIp } from '@supercharge/request-ip';

@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // const api_key = this.config.getOrThrow('API_KEY');
    // const request = context.switchToHttp().getRequest();
    // console.log('IP IS!', getClientIp(request));
    return true;
  }

  private isFromMeli() {}
}
