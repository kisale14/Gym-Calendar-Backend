import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { Attendance } from './entities/attendance.entity.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly db: DatabaseService) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    userId?: string,
  ): Promise<Attendance> {
    const { schedule_id, user_id, attendance_status_id, attended_at, notes } =
      createAttendanceDto;

    try {
      const query = `
        INSERT INTO scheduling.attendance (
          schedule_id, user_id, attendance_status_id, attended_at, notes, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        schedule_id,
        user_id,
        attendance_status_id,
        attended_at || null,
        notes || null,
        userId || null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Ya existe un registro de asistencia para este usuario en el horario indicado.',
        );
      }
      if (error.code === '23503') {
        throw new NotFoundException(
          'El horario, el usuario o el estado de asistencia especificado no existen.',
        );
      }
      throw new InternalServerErrorException(
        'Error al registrar la asistencia.',
      );
    }
  }

  async findAll(): Promise<Attendance[]> {
    const query = `
      SELECT * FROM scheduling.attendance 
      WHERE is_deleted = FALSE 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Attendance> {
    const query = `
      SELECT * FROM scheduling.attendance 
      WHERE id = $1 AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Registro de asistencia con ID '${id}' no encontrado.`,
      );
    }

    return result.rows[0];
  }

  async update(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
    userId?: string,
  ): Promise<Attendance> {
    const current = await this.findOne(id);

    const schedule_id = updateAttendanceDto.schedule_id ?? current.schedule_id;
    const user_id = updateAttendanceDto.user_id ?? current.user_id;
    const attendance_status_id =
      updateAttendanceDto.attendance_status_id ?? current.attendance_status_id;
    const attended_at = updateAttendanceDto.attended_at ?? current.attended_at;
    const notes = updateAttendanceDto.notes ?? current.notes;

    try {
      const query = `
        UPDATE scheduling.attendance 
        SET 
          schedule_id = $1,
          user_id = $2,
          attendance_status_id = $3,
          attended_at = $4,
          notes = $5,
          updated_by = $6,
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        schedule_id,
        user_id,
        attendance_status_id,
        attended_at || null,
        notes || null,
        userId || null,
        id,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Ya existe otro registro de asistencia para este usuario y horario.',
        );
      }
      if (error.code === '23503') {
        throw new NotFoundException(
          'Alguna de las referencias (horario, usuario o estado) no es válida.',
        );
      }
      throw new InternalServerErrorException(
        'Error al actualizar el registro de asistencia.',
      );
    }
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `
      UPDATE scheduling.attendance 
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    await this.db.query(query, [userId || null, id]);

    return {
      message: `Registro de asistencia con ID '${id}' eliminado exitosamente.`,
    };
  }
}
