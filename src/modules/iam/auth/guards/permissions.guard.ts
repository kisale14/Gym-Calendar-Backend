import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../../../decorators/permissions.decorator.js';
import { DatabaseService } from '../../../../database/database.service.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtener los permisos requeridos por el decorador en la ruta
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no requiere ningún permiso específico, se permite el paso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Inyectado previamente por el JwtAuthGuard

    if (!user || !user.userId) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    // 2. Consultar en la BD si el usuario posee los permisos requeridos a través de sus roles
    const query = `
      SELECT DISTINCT p.name
      FROM seguridad.permissions p
      INNER JOIN seguridad.role_permissions rp ON p.id = rp.permission_id
      INNER JOIN seguridad.user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1 AND p.name = ANY($2);
    `;

    const result = await this.db.query(query, [
      user.userId,
      requiredPermissions,
    ]);
    const userPermissions = result.rows.map((row) => row.name);

    // 3. Verificar si el usuario cumple con al menos uno (o todos) los permisos requeridos
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'No tienes los permisos suficientes para realizar esta acción.',
      );
    }

    return true;
  }
}
