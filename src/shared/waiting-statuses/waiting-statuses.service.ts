import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateWaitingStatusDto } from './dto/create-waiting-status.dto.js';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto.js';
import { WaitingStatus } from './entities/waiting-status.entity.js';

@Injectable()
export class WaitingStatusesService {
  constructor(private readonly db: DatabaseService) {}

  async create(
    createWaitingStatusDto: CreateWaitingStatusDto,
  ): Promise<WaitingStatus> {
    const { code, name, description } = createWaitingStatusDto;

    try {
      const query = `
        INSERT INTO shared.waiting_statuses (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await this.db.query(query, [code, name, description]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Ya existe un estado de espera con el código o nombre especificado.`,
        );
      }
      throw new InternalServerErrorException(
        'Error al crear el estado de espera.',
      );
    }
  }

  async findAll(): Promise<WaitingStatus[]> {
    const query = `SELECT * FROM shared.waiting_statuses ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<WaitingStatus> {
    const query = `SELECT * FROM shared.waiting_statuses WHERE id = $1;`;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Estado de espera con ID '${id}' no encontrado.`,
      );
    }

    return result.rows[0];
  }

  async update(
    id: string,
    updateWaitingStatusDto: UpdateWaitingStatusDto,
  ): Promise<WaitingStatus> {
    await this.findOne(id);

    const { code, name, description } = updateWaitingStatusDto;

    try {
      const query = `
        UPDATE shared.waiting_statuses 
        SET 
          code = COALESCE($1, code),
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *;
      `;
      const result = await this.db.query(query, [code, name, description, id]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Conflicto de unicidad: el código o nombre ya están registrados.`,
        );
      }
      throw new InternalServerErrorException(
        'Error al actualizar el estado de espera.',
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `DELETE FROM shared.waiting_statuses WHERE id = $1;`;
    await this.db.query(query, [id]);

    return {
      message: `Estado de espera con ID '${id}' eliminado exitosamente.`,
    };
  }
}
