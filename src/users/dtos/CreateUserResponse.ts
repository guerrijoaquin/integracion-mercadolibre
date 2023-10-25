import { User } from '../entity/user.entity';
import { AccountActions } from '../users.service';

export interface CreateUserResponse {
  user: User;
  action: AccountActions;
}
