import { User } from 'src/users/entity/user.entity';

export interface FetchUserResourceDto {
  data: any;
  user: User;
}
