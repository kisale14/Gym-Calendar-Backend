import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { Schedule } from './entities/schedule.entity.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createScheduleDto: CreateScheduleDto, userId?: string): Promise<Schedule> {
    const { lesson_id, instructor_id, event_date, start_time, end_time } = createScheduleDto;

    // Validación lógica complementaria para asegurar que start_time sea menor que end_time
    if (start_time >= end_time) {
      throw new BadRequestException('La hora de inicio debe ser menor que la hora de finalización.');
    }

    try {
      const query = `
        INSERT INTO scheduling.schedules (lesson_id, instructor_id, event_date, start_time, end_time, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING *;
      `;
      const result = await this.db.query(query, [lesson_id, instructor_id, event_date, start_time, end_time, userId || null]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        throw new NotFoundException('La combinación de clase e instructor no existe en la tabla de asignaciones (lessons_instructors).');
      }
      if (error.code === '23514') { // Violación de constraint CHECK
        throw new BadRequestException('La hora de inicio no puede ser mayor o igual a la hora de fin.');
      }
      throw new InternalServerErrorException('Error al crear el horario de la clase.');
    }
  }

  async findAll(): Promise<Schedule[]> {
    const query = `
      SELECT * FROM scheduling.schedules 
      WHERE is_deleted = FALSE 
      ORDER BY event_date ASC, start_time ASC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Schedule> {
    const query = `
      SELECT * FROM scheduling.schedules 
      WHERE id = $1 AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Horario con ID '${id}' no encontrado.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto, userId?: string): Promise<Schedule> {
    const currentSchedule = await this.findOne(id);

    const lesson_id = updateScheduleDto.lesson_id ?? currentSchedule.lesson_id;
    const instructor_id = updateScheduleDto.instructor_id ?? currentSchedule.instructor_id;
    const event_date = updateScheduleDto.event_date ?? currentSchedule.event_date;
    const start_time = updateScheduleDto.start_time ?? currentSchedule.start_time;
    const end_time = updateScheduleDto.end_time ?? currentSchedule.end_time;

    if (start_time >= end_time) {
      throw new BadRequestException('La hora de inicio debe ser menor que la hora de finalización.');
    }

    try {
      const query = `
        UPDATE scheduling.schedules 
        SET 
          lesson_id = $1,
          instructor_id = $2,
          event_date = $3,
          start_time = $4,
          end_time = $5,
          updated_by = $6,
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        lesson_id,
        instructor_id,
        event_date,
        start_time,
        end_time,
        userId || null,
        id,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        throw new NotFoundException('La nueva combinación de clase e instructor no es válida.');
      }
      throw new InternalServerErrorException('Error al actualizar el horario.');
    }
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `
      UPDATE scheduling.schedules 
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    await this.db.query(query, [userId || null, id]);

    return { message: `Horario con ID '${id}' eliminado exitosamente.` };
  }
}