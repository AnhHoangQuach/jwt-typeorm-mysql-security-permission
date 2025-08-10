import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PERMITALL } from 'src/common/custom-decorator';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject()
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPermitAll = this.reflector.getAllAndOverride<boolean>(
      IS_PERMITALL,
      [context.getHandler(), context.getClass()],
    );

    if (isPermitAll) return true;

    const request: Request = context.switchToHttp().getRequest();

    const authorization = request.headers['authorization'];
    if (!authorization)
      throw new UnauthorizedException('No authorization token found');

    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token found');

    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
