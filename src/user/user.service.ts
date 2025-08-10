import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { Permission } from 'src/user/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';
import { LoginUserVo } from 'src/user/vo/login-user.vo';
import { Role } from 'src/user/entities/role.entity';

function md5(password: string) {
  const hash = createHash('md5');
  hash.update(password);
  return hash.digest('hex');
}

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  async register(user: RegisterUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: user.username },
    });
    if (existingUser) throw new HttpException('User already exists', 409);

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;

    try {
      return this.userRepository.save(newUser);
    } catch {
      throw new HttpException('Error registering user', 500);
    }
  }

  async login(user: LoginUserDto): Promise<LoginUserVo> {
    const existingUser = await this.userRepository.findOne({
      where: { username: user.username, password: md5(user.password) },
    });

    if (!existingUser) throw new HttpException('Invalid credentials', 401);

    const token = this.jwtService.sign({
      id: existingUser.id,
      username: existingUser.username,
      iat: Math.floor(Date.now() / 1000),
    });

    const loginUserVo = new LoginUserVo();
    loginUserVo.elements = {
      user: existingUser,
      token,
    };

    return loginUserVo;
  }

  async getPermissionsByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['permissions'],
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  async getRolesByUserId(id: number) {
    const roles = await this.roleRepository.find({
      where: { id },
      relations: ['permissions'],
    });
    return roles;
  }
}
