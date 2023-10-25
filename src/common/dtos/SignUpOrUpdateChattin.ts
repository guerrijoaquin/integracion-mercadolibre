import { AccountActions } from 'src/users/users.service';
import { ChattinSignupDto } from './ChattinSignup.dto';

export interface SignUpOrUpdateChattin {
  data: ChattinSignupDto;
  action: AccountActions;
}
