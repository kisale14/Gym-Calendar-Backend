import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { Role } from './entities/role.entity.js';

@Injectable()
export class RolesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const query = `
      INSERT INTO seguridad.roles (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description, created_at, updated_at;
    `;
    const values = [createRoleDto.name, createRoleDto.description ?? null];

    const result = await this.db.query<Role>(query, values);
    return result.rows[0];
  }

  async findAll(): Promise<Role[]> {
    // Consulta simple para traer solo los roles sin permisos (ideal para selectores/dropdowns)
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM seguridad.roles
      ORDER BY created_at DESC;
    `;

    const result = await this.db.query<Role>(query);
    return result.rows;
  }

  async findAllWithPermissions(): Promise<any[]> {
    // Consulta para traer los roles junto con sus permisos asociados agrupados por recurso
    const query = `
      SELECT 
        r.id AS role_id,
        r.name AS role_name,
        r.description AS role_description,
        r.created_at AS role_created_at,
        r.updated_at AS role_updated_at,
        p.id AS permission_id,
        p.name AS permission_name,
        p.description AS permission_description
      FROM seguridad.roles r
      LEFT JOIN seguridad.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN seguridad.permissions p ON rp.permission_id = p.id
      ORDER BY r.created_at DESC;
    `;

    const result = await this.db.query(query);

    // Estructura temporal para agrupar por rol ID
    const rolesMap = new Map<string, any>();

    for (const row of result.rows) {
      if (!rolesMap.has(row.role_id)) {
        rolesMap.set(row.role_id, {
          id: row.role_id,
          name: row.role_name,
          description: row.role_description,
          created_at: row.role_created_at,
          updated_at: row.role_updated_at,
          permissions_by_resource: {}, // Aquí agruparemos los permisos
        });
      }

      // Si el rol tiene un permiso asociado
      if (row.permission_id) {
        const role = rolesMap.get(row.role_id);

        // El formato del permiso es tipicamente "recurso:accion" (ej. "lessons:create")
        const [resourceKey] = row.permission_name.split(':');

        // Transformar el recurso en un título presentable (ej. "lessons" -> "Lessons")
        const resourceTitle = resourceKey
          ? resourceKey.charAt(0).toUpperCase() +
            resourceKey.slice(1).toLowerCase()
          : 'General';

        if (!role.permissions_by_resource[resourceTitle]) {
          role.permissions_by_resource[resourceTitle] = [];
        }

        role.permissions_by_resource[resourceTitle].push({
          id: row.permission_id,
          name: row.permission_name,
          description: row.permission_description,
        });
      }
    }

    return Array.from(rolesMap.values());
  }

  async findOne(id: string): Promise<Role> {
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM seguridad.roles
      WHERE id = $1;
    `;
    const values = [id];

    const result = await this.db.query<Role>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const query = `
      UPDATE seguridad.roles
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, description, created_at, updated_at;
    `;
    const values = [
      updateRoleDto.name ?? null,
      updateRoleDto.description ?? null,
      id,
    ];

    const result = await this.db.query<Role>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  async remove(id: number): Promise<{ message: string; deletedRole: Role }> {
    const query = `
      DELETE FROM seguridad.roles
      WHERE id = $1
      RETURNING id, name, description, created_at, updated_at;
    `;
    const values = [id];

    const result = await this.db.query<Role>(query, values);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    const deletedRole = result.rows[0];

    return {
      message: `Rol '${deletedRole.name}' eliminado exitosamente`,
      deletedRole,
    };
  }
}
