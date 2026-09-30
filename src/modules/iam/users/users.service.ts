import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password_hash, saltRounds);

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
        throw new ConflictException('El correo electrónico o el nombre de usuario ya se encuentran registrados.');
      }
      // Violación de llave foránea (gender_id no existe)
      if (error.code === '23503') {
        throw new NotFoundException('El género especificado no existe.');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT 
        u.*, 
        g.name AS gender_name 
      FROM seguridad.users u
      INNER JOIN shared.genders g ON u.gender_id = g.id
      WHERE u.is_deleted = false 
      ORDER BY u.created_at DESC;
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
        throw new ConflictException('El correo o el nombre de usuario ya están en uso por otro registro.');
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
      throw new NotFoundException(`Usuario con ID ${id} no encontrado o ya ha sido eliminado`);
    }

    const deletedUser = result.rows[0];

    return {
      message: `Usuario '${deletedUser.username}' eliminado exitosamente`,
      deletedUser,
    };
  }
}