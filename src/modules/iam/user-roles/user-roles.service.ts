import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateUserRoleDto } from './dto/create-user-role.dto.js';
import { RoleWithPermissionsEntity } from './entities/user-role.entity.js';

@Injectable()
export class UserRolesService {
  constructor(private readonly db: DatabaseService) {}

  // 1. Asignar un rol a un usuario
  async assignRole(dto: CreateUserRoleDto) {
    try {
      const query = `
        INSERT INTO seguridad.user_roles (user_id, role_id)
        VALUES ($1, $2)
        RETURNING user_id, role_id, created_at;
      `;
      const values = [dto.user_id, dto.role_id];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Este usuario ya tiene asignado este rol.');
      }
      if (error.code === '23503') {
        throw new NotFoundException(
          'El usuario o el rol especificado no existen.',
        );
      }
      throw error;
    }
  }

  // 2. Obtener todos los roles que pertenecen a un usuario específico
  async findRolesByUser(userId: string): Promise<RoleWithPermissionsEntity[]> {
    const query = `
      SELECT 
        r.id, 
        r.name, 
        r.description, 
        r.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'description', p.description
            )
          ) FILTER (WHERE p.id IS NOT NULL), 
          '[]'
        ) AS permissions
      FROM seguridad.roles r
      INNER JOIN seguridad.user_roles ur ON r.id = ur.role_id
      LEFT JOIN seguridad.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN seguridad.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1
      GROUP BY r.id, r.name, r.description, r.created_at
      ORDER BY r.name ASC;
    `;
    const result = await this.db.query<RoleWithPermissionsEntity>(query, [
      userId,
    ]);
    return result.rows;
  }

  // 3. Remover un rol de un usuario (Desasignar)
  async removeRole(userId: string, roleId: string) {
    const query = `
      DELETE FROM seguridad.user_roles
      WHERE user_id = $1 AND role_id = $2
      RETURNING user_id, role_id;
    `;
    const result = await this.db.query(query, [userId, roleId]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'La relación entre el usuario y el rol no existe.',
      );
    }

    return {
      message: 'Rol desasignado del usuario exitosamente',
      deleted: result.rows[0],
    };
  }
}
