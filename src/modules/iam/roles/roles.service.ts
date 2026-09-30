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
    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM seguridad.roles
      ORDER BY created_at DESC;
    `;

    const result = await this.db.query<Role>(query);
    return result.rows;
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
      id
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