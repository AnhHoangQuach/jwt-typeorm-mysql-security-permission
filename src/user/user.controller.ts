import { Body, Controller, Post } from '@nestjs/common';
import { PermitAll } from 'src/common/custom-decorator';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginUserVo } from 'src/user/vo/login-user.vo';

@Controller('user')
@PermitAll()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() user: RegisterUserDto) {
    return this.userService.register(user);
  }

  @Post('login')
  login(@Body() user: LoginUserDto): Promise<LoginUserVo> {
    return this.userService.login(user);
  }
}
