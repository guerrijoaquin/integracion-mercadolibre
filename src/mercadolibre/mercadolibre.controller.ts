import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { MercadolibreService } from './mercadolibre.service';
import { AuthUserQueryFTDto } from './dtos/AuthUserQueryFT.dto';
import { IsAuthorizedGuard } from 'src/common/guards/IsAuthorized.guard';

@Controller('mercadolibre')
export class MercadolibreController {
  constructor(private readonly mercadolibreService: MercadolibreService) {}

  //auth.mercadolibre.com.ar/authorization?response_type=code&client_id=1128712925782425&redirect_uri=http://localhost:3000/mercadolibre/auth&state=iddelusuario
  @Get('auth')
  auth(@Query() query: AuthUserQueryFTDto, @Res() res) {
    return this.mercadolibreService.authAndLink(query.code, query.state, res);
  }
}
