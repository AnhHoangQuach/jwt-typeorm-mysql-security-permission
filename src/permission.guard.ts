import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(Reflector)
  private readonly reflector: Reflector;

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const userContext = context.switchToHttp().getRequest().user;

    if (!userContext) {
      throw new UnauthorizedException('User not found');
    }

    const foundUser = await this.userService.getPermissionsByUsername(
      userContext.username,
    );

    if (!foundUser) {
      throw new UnauthorizedException('Permission denied');
    }

    if (!foundUser.permissions || foundUser.permissions.length === 0) {
      throw new UnauthorizedException('Permission denied');
    }

    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (!requiredPermissions || requiredPermissions.length === 0) {
      throw new UnauthorizedException('Permission denied');
    }

   const hasPermission = foundUser.permissions.some(userPermission => requiredPermissions.includes(userPermission.name));
    if (!hasPermission) {
      throw new UnauthorizedException('Permission denied');
    }
    return true;
  }
}
