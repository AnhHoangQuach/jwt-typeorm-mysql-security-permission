import { User } from 'src/user/entities/user.entity';

export class LoginUserVo {
  elements: {
    user: User;
    token: string;
  };
  status: string;
}
