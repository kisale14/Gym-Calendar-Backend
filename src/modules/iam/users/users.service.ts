import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password_hash,
      saltRounds,
    );

    try {
      const query = `
        INSERT INTO seguridad.users (
          name, lastname, date_birth, email, username, password_hash, image, phone, gender_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const values = [
        createUserDto.name,
        createUserDto.lastname,
        createUserDto.date_birth,
        createUserDto.email,
        createUserDto.username,
        hashedPassword,
        createUserDto.image ?? null,
        createUserDto.phone ?? null,
        createUserDto.gender_id,
      ];

      const result = await this.db.query<User>(query, values);
      return result.rows[0];
    } catch (error: any) {
      // Manejo de restricciones únicas en PostgreSQL (email o username duplicados)
      if (error.code === '23505') {
        throw new ConflictException(
          'El correo electrónico o el nombre de usuario ya se encuentran registrados.',
        );
      }
      // Violación de llave foránea (gender_id no existe)
      if (error.code === '23503') {
        throw new NotFoundException('El género especificado no existe.');
      }
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Partial<User>>> {
    const currentPage = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));
    const offset = (currentPage - 1) * itemsPerPage;

    // 1. Obtener el conteo total de usuarios activos
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM seguridad.users u
      WHERE u.is_deleted = false;
    `;
    const countResult = await this.db.query(countQuery);
    const total = parseInt(countResult.rows[0].total, 10);

    // 2. Consultar los usuarios paginados (excluyendo columnas sensibles)
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.lastname, 
        u.date_birth, 
        u.email, 
        u.username, 
        u.image, 
        u.phone, 
        u.gender_id, 
        g.name AS gender_name,
        r.name AS role_name, -- <--- Rol del usuario
        u.is_deleted, 
        u.version, 
        u.created_at, 
        u.updated_at
      FROM seguridad.users u
      INNER JOIN shared.genders g ON u.gender_id = g.id
      LEFT JOIN seguridad.user_roles ur ON u.id = ur.user_id
      LEFT JOIN seguridad.roles r ON ur.role_id = r.id
      WHERE u.is_deleted = false 
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await this.db.query<User>(query, [itemsPerPage, offset]);

    // Limpieza adicional de seguridad por cada registro
    const data = result.rows.map((user) => {
      delete user.password_hash;
      delete user.current_refresh_token;
      return user;
    });

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      data,
      meta: {
        total,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: totalPages === 0 ? 1 : totalPages,
      },
    };
  }

  async findInstructors(): Promise<Partial<User>[]> {
    const query = `
      SELECT
        u.id,
        u.name,
        u.lastname,
        u.email,
        u.username,
        u.image,
        u.phone,
        u.gender_id,
        g.name AS gender_name,
        u.created_at,
        u.updated_at
      FROM seguridad.users u
      INNER JOIN shared.genders g ON u.gender_id = g.id
      INNER JOIN seguridad.user_roles ur ON u.id = ur.user_id
      INNER JOIN seguridad.roles r ON ur.role_id = r.id
      WHERE LOWER(r.name) = 'instructor'
        AND u.is_deleted = false
      ORDER BY u.name ASC;
    `;

    const result = await this.db.query<User>(query);
    return result.rows;
  }

  async findOne(id: string): Promise<User> {
    const query = `
      SELECT 
        u.*, 
        g.name AS gender_name 
      FROM seguridad.users u
      INNER JOIN shared.genders g ON u.gender_id = g.id
      WHERE u.id = $1 AND u.is_deleted = false;
    `;
    const result = await this.db.query<User>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const query = `
      UPDATE seguridad.users
      SET
        name = COALESCE($1, name),
        lastname = COALESCE($2, lastname),
        date_birth = COALESCE($3, date_birth),
        email = COALESCE($4, email),
        username = COALESCE($5, username),
        password_hash = COALESCE($6, password_hash),
        image = COALESCE($7, image),
        phone = COALESCE($8, phone),
        gender_id = COALESCE($9, gender_id),
        version = version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND is_deleted = false
      RETURNING *;
    `;
    const values = [
      updateUserDto.name ?? null,
      updateUserDto.lastname ?? null,
      updateUserDto.date_birth ?? null,
      updateUserDto.email ?? null,
      updateUserDto.username ?? null,
      updateUserDto.password_hash ?? null,
      updateUserDto.image ?? null,
      updateUserDto.phone ?? null,
      updateUserDto.gender_id ?? null,
      id,
    ];

    try {
      const result = await this.db.query<User>(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'El correo o el nombre de usuario ya están en uso por otro registro.',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string; deletedUser: User }> {
    // Aplicamos borrado lógico tal como estructuraste tu tabla (is_deleted = true)
    const query = `
      UPDATE seguridad.users
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_deleted = false
      RETURNING *;
    `;
    const result = await this.db.query<User>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado o ya ha sido eliminado`,
      );
    }

    const deletedUser = result.rows[0];

    return {
      message: `Usuario '${deletedUser.username}' eliminado exitosamente`,
      deletedUser,
    };
  }
}
