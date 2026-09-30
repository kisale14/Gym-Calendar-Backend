// src/shared/genders/genders.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateGenderDto } from './dto/create-gender.dto.js';
import { UpdateGenderDto } from './dto/update-gender.dto.js';
import { Gender } from './entities/gender.entity.js';

@Injectable()
export class GendersService {
  constructor(private readonly db: DatabaseService) {}

  async create(createGenderDto: CreateGenderDto): Promise<Gender> {
    try {
      const query = `
        INSERT INTO shared.genders (name)
        VALUES ($1)
        RETURNING id, name, created_at, updated_at;
      `;
      const values = [createGenderDto.name];
      const result = await this.db.query<Gender>(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El nombre de este género ya se encuentra registrado.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Gender[]> {
    const query = `
      SELECT id, name, created_at, updated_at 
      FROM shared.genders 
      ORDER BY name ASC;
    `;
    const result = await this.db.query<Gender>(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Gender> {
    const query = `
      SELECT id, name, created_at, updated_at 
      FROM shared.genders 
      WHERE id = $1;
    `;
    const result = await this.db.query<Gender>(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    return result.rows[0];
  }

  async update(id: string, updateGenderDto: UpdateGenderDto): Promise<Gender> {
    try {
      const query = `
        UPDATE shared.genders
        SET 
          name = COALESCE($1, name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, created_at, updated_at;
      `;
      const values = [updateGenderDto.name ?? null, id];
      const result = await this.db.query<Gender>(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundException(`Género con ID ${id} no encontrado`);
      }

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El nombre de este género ya está en uso.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string; deletedGender: Gender }> {
    try {
      const query = `
        DELETE FROM shared.genders
        WHERE id = $1
        RETURNING id, name, created_at, updated_at;
      `;
      const result = await this.db.query<Gender>(query, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundException(`Género con ID ${id} no encontrado`);
      }

      const deletedGender = result.rows[0];
      return {
        message: `Género '${deletedGender.name}' eliminado exitosamente`,
        deletedGender,
      };
    } catch (error: any) {
      // Código PostgreSQL para violación de llave foránea (si hay usuarios u otras tablas apuntando a este género)
      if (error.code === '23503') {
        throw new ConflictException('No se puede eliminar el género porque está asociado a uno o más usuarios.');
      }
      throw error;
    }
  }
}