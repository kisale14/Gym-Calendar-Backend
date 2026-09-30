// src/shared/statuses/statuses.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateStatusDto } from './dto/create-status.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { Status } from './entities/status.entity.js';

@Injectable()
export class StatusesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createStatusDto: CreateStatusDto): Promise<Status> {
    const { context, code, name, description } = createStatusDto;

    try {
      const query = `
        INSERT INTO shared.statuses (context, code, name, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const result = await this.db.query(query, [context, code, name, description]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un estado con el contexto '${context}' y el código/nombre especificado.`);
      }
      throw new InternalServerErrorException('Error al crear el estado.');
    }
  }

  async findAll(): Promise<Status[]> {
    const query = `SELECT * FROM shared.statuses ORDER BY context ASC, created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Status> {
    const query = `SELECT * FROM shared.statuses WHERE id = $1;`;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Estado con ID '${id}' no encontrado.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateStatusDto: UpdateStatusDto): Promise<Status> {
    await this.findOne(id);

    const { context, code, name, description } = updateStatusDto;

    try {
      const query = `
        UPDATE shared.statuses 
        SET 
          context = COALESCE($1, context),
          code = COALESCE($2, code),
          name = COALESCE($3, name),
          description = COALESCE($4, description),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
      `;
      const result = await this.db.query(query, [context, code, name, description, id]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Conflicto de unicidad: ya existe una combinación idéntica de contexto, código o nombre.`);
      }
      throw new InternalServerErrorException('Error al actualizar el estado.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `DELETE FROM shared.statuses WHERE id = $1;`;
    await this.db.query(query, [id]);

    return { message: `Estado con ID '${id}' eliminado exitosamente.` };
  }
}