import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto.js';
import { PermissionDetailEntity } from './entities/role-permission.entity.js';

@Injectable()
export class RolePermissionsService {
  constructor(private readonly db: DatabaseService) {}

  // 1. Asignar un permiso a un rol
  async assignPermission(dto: CreateRolePermissionDto) {
    try {
      const query = `
        INSERT INTO seguridad.role_permissions (role_id, permission_id)
        VALUES ($1, $2)
        RETURNING role_id, permission_id, created_at;
      `;
      const values = [dto.role_id, dto.permission_id];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      // Código de error de PostgreSQL para violación de llave única (duplicado)
      if (error.code === '23505') {
        throw new ConflictException('Este rol ya tiene asignado este permiso.');
      }
      // Código de error de PostgreSQL para llave foránea no encontrada (rol o permiso no existe)
      if (error.code === '23503') {
        throw new NotFoundException(
          'El rol o el permiso especificado no existen.',
        );
      }
      throw error;
    }
  }

  // 2. Obtener todos los permisos que pertenecen a un rol específico
  async findPermissionsByRole(
    roleId: string,
  ): Promise<PermissionDetailEntity[]> {
    const query = `
      SELECT p.id, p.name, p.description, p.created_at 
      FROM seguridad.permissions p 
      INNER JOIN seguridad.role_permissions rp 
      ON p.id = rp.permission_id 
      WHERE rp.role_id = $1 ORDER BY p.name ASC;
    `;
    const result = await this.db.query<PermissionDetailEntity>(query, [roleId]);
    return result.rows;
  }

  // 3. Remover un permiso de un rol (Desasignar)
  async removePermission(roleId: string, permissionId: string) {
    const query = `
      DELETE FROM seguridad.role_permissions
      WHERE role_id = $1 AND permission_id = $2
      RETURNING role_id, permission_id;
    `;
    const result = await this.db.query(query, [roleId, permissionId]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'La relación entre el rol y el permiso no existe.',
      );
    }

    return {
      message: 'Permiso desasignado del rol exitosamente',
      deleted: result.rows[0],
    };
  }
}
