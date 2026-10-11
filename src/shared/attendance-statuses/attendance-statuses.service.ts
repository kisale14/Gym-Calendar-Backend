// src/shared/attendance-statuses/attendance-statuses.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateAttendanceStatusDto } from './dto/create-attendance-status.dto.js';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto.js';
import { AttendanceStatus } from './entities/attendance-status.entity.js';

@Injectable()
export class AttendanceStatusesService {
  constructor(private readonly db: DatabaseService) {}

  async create(
    createAttendanceStatusDto: CreateAttendanceStatusDto,
  ): Promise<AttendanceStatus> {
    const { code, name, description } = createAttendanceStatusDto;

    try {
      const query = `
        INSERT INTO shared.attendance_statuses (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await this.db.query(query, [code, name, description]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Ya existe un estado de asistencia con el código o nombre especificado.`,
        );
      }
      throw new InternalServerErrorException(
        'Error al crear el estado de asistencia.',
      );
    }
  }

  async findAll(): Promise<AttendanceStatus[]> {
    const query = `SELECT * FROM shared.attendance_statuses ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<AttendanceStatus> {
    const query = `SELECT * FROM shared.attendance_statuses WHERE id = $1;`;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Estado de asistencia con ID '${id}' no encontrado.`,
      );
    }

    return result.rows[0];
  }

  async update(
    id: string,
    updateAttendanceStatusDto: UpdateAttendanceStatusDto,
  ): Promise<AttendanceStatus> {
    await this.findOne(id);

    const { code, name, description } = updateAttendanceStatusDto;

    try {
      const query = `
        UPDATE shared.attendance_statuses 
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
        'Error al actualizar el estado de asistencia.',
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `DELETE FROM shared.attendance_statuses WHERE id = $1;`;
    await this.db.query(query, [id]);

    return {
      message: `Estado de asistencia con ID '${id}' eliminado exitosamente.`,
    };
  }
}
