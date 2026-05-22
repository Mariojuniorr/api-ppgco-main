import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PERMISSION_KEY } from './permissions.decorator';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/roles';
import { PermissionsService } from './permissions.service';
import { RoleHasPermissionsService } from 'src/role-has-permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  public constructor(
    protected readonly reflector: Reflector,
    protected readonly configService: ConfigService,
    protected readonly permissionsService: PermissionsService,
    protected readonly roleHasPermissionsService: RoleHasPermissionsService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const [permissionName, guardName] = this.reflector.getAllAndMerge<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissionName) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { params } = request;
    
    let targetUserId: string | undefined = params?.id;
    if (!targetUserId && request.path) {
      const match = request.path.match(/^\/users\/(\d+)/);
      if (match) {
        targetUserId = match[1];
      }
    }

    console.log(`[PermissionGuard] Checking access: permissionName="${permissionName}", user="${request.user?.id}", targetUserId="${targetUserId}", path="${request.path}"`);

    if (targetUserId && request.user && Number(request.user.id) === Number(targetUserId)) {
      if (permissionName === 'user.update' || permissionName === 'user.read') {
        const requiredSelfPermission = permissionName === 'user.update' ? 'profile.update' : 'profile.read';
        const userPermissions = await this.permissionsService.getUserPermissions(request.user);
        const hasPermission = userPermissions.some(p => p.name === requiredSelfPermission);
        if (hasPermission) {
          console.log(`[PermissionGuard] Bypassing ${permissionName} for self (User ID: ${request.user.id}) because user has ${requiredSelfPermission}`);
          return true;
        } else {
          console.log(`[PermissionGuard] Denied self bypass: user lacks ${requiredSelfPermission}`);
          return false;
        }
      }
    }

    if (!request.user || !request.user.roles) {
      return true;
    }

    const permission = await this.permissionsService.findByName(
      permissionName,
      guardName,
    );

    if (!permission) {
      throw new Error('Permission not found');
    }

    return this.roleHasPermissionsService.hasPermissions(
      request.user.roles.map((role: Role) => role.id),
      permission.dataValues.id,
    );
  }
}
