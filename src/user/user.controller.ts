import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { LoginGuard } from 'src/login.guard';
import { PermissionGuard } from 'src/permission.guard';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginUserVo } from 'src/user/vo/login-user.vo';

@Controller('user')
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

  @Get('profile')
  @UseGuards(LoginGuard)
  getProfile(@Req() req: Request) {
    return req['user'];
  }

  @Delete('/:id')
  @UseGuards(LoginGuard, PermissionGuard)
  @SetMetadata('permissions', ['DEL_USER'])
  deleteAccount(@Param('id') id: string) {
    return id;
  }
}
