import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { Permission } from './entities/permission.entity.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly db: DatabaseService) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const query = `
      INSERT INTO seguridad.permissions (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at;
    `;
    const values = [createPermissionDto.name, createPermissionDto.description];

    const result = await this.db.query<Permission>(query, values);
    return result.rows[0];
  }

  async findAll(): Promise<Record<string, any[]>> {
    const query = `
      SELECT id, name, description, created_id, updated_at, created_at
      FROM seguridad.permissions
      ORDER BY created_at DESC;
    `;

    // Si tu columna de auditoría se llama solo 'created_at' (como en tu entidad):
    const correctedQuery = `
      SELECT id, name, description, created_at, updated_at
      FROM seguridad.permissions
      ORDER BY created_at DESC;
    `;

    const result = await this.db.query(correctedQuery);

    // Objeto contenedor para agrupar por recurso
    const groupedPermissions: Record<string, any[]> = {};

    for (const permission of result.rows) {
      // Extraer el recurso del nombre del permiso (ej: "lessons:create" -> "lessons")
      const [resourceKey] = permission.name.split(':');

      // Formatear el título del recurso (ej: "lessons" -> "Lessons")
      const resourceTitle = resourceKey
        ? resourceKey.charAt(0).toUpperCase() +
          resourceKey.slice(1).toLowerCase()
        : 'General';

      if (!groupedPermissions[resourceTitle]) {
        groupedPermissions[resourceTitle] = [];
      }

      groupedPermissions[resourceTitle].push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        created_at: permission.created_at,
        updated_at: permission.updated_at,
      });
    }

    return groupedPermissions;
  }

  async findOne(id: string): Promise<Permission> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM seguridad.permissions
      WHERE id = $1;
    `;
    const values = [id];

    const result = await this.db.query<Permission>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const query = `
      UPDATE seguridad.permissions
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, description, created_at, updated_at;
    `;
    const values = [
      updatePermissionDto.name ?? null,
      updatePermissionDto.description ?? null,
      id,
    ];

    const result = await this.db.query<Permission>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  async remove(
    id: string,
  ): Promise<{ message: string; deletedPermission: Permission }> {
    const query = `
      DELETE FROM seguridad.permissions
      WHERE id = $1
      RETURNING id, name, description, created_at, updated_at;
    `;
    const values = [id];

    const result = await this.db.query<Permission>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    const deletedPermission = result.rows[0];

    return {
      message: `Permiso '${deletedPermission.name}' eliminado exitosamente`,
      deletedPermission,
    };
  }
}
