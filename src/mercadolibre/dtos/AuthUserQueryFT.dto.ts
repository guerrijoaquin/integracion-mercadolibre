import { IsString } from 'class-validator';

export class AuthUserQueryFTDto {
  @IsString()
  code: string;

  @IsString()
  state: string;
}
