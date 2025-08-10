import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_REQUIRED_PERMISSIONS } from 'src/common/custom-decorator';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PermissionRbacGuard implements CanActivate {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject()
  private reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userContext = context.switchToHttp().getRequest().user;

    if (!userContext) {
      throw new UnauthorizedException('User not found');
    }

    const userPermissions = await this.userService.getRolesByUserId(
      userContext.id,
    );

    if (!userPermissions || userPermissions.length === 0) {
      throw new UnauthorizedException('User has no permissions');
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      IS_REQUIRED_PERMISSIONS,
      [context.getHandler(), context.getClass()],
    );

    const hasPermission = userPermissions.some(
      (role) =>
        role.permissions &&
        role.permissions.some((permission) =>
          requiredPermissions.includes(permission.name),
        ),
    );

    return hasPermission;
  }
}
