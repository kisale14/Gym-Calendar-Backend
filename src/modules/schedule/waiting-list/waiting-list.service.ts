import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto.js';
import { UpdateWaitingListDto } from './dto/update-waiting-list.dto.js';
import { WaitingList } from './entities/waiting-list.entity.js';

@Injectable()
export class WaitingListService {
  constructor(private readonly db: DatabaseService) {}

  private validateDates(dto: { notified_at?: string; confirmation_deadline_at?: string }) {
    const { notified_at, confirmation_deadline_at } = dto;
    if ((notified_at && !confirmation_deadline_at) || (!notified_at && confirmation_deadline_at)) {
      throw new BadRequestException('Si se especifica la fecha de notificación, el plazo de confirmación es obligatorio (y viceversa).');
    }
  }

  async create(createDto: CreateWaitingListDto, userId?: string): Promise<WaitingList> {
    this.validateDates(createDto);

    const {
      schedule_id,
      user_id,
      waiting_status_id,
      position,
      notified_at,
      confirmation_deadline_at,
      confirmed_at,
      declined_at,
      cancelled_at,
      converted_at,
    } = createDto;

    try {
      const query = `
        INSERT INTO scheduling.waiting_list (
          schedule_id, user_id, waiting_status_id, position,
          notified_at, confirmation_deadline_at, confirmed_at,
          declined_at, cancelled_at, converted_at, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        schedule_id,
        user_id,
        waiting_status_id,
        position,
        notified_at || null,
        confirmation_deadline_at || null,
        confirmed_at || null,
        declined_at || null,
        cancelled_at || null,
        converted_at || null,
        userId || null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El usuario ya está en la lista de espera para este horario, o la posición ya se encuentra ocupada.');
      }
      if (error.code === '23503') {
        throw new NotFoundException('El horario, el usuario o el estado de lista de espera especificado no existen.');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Los datos proporcionados violan las reglas de validación (posición > 0 o restricciones de fechas).');
      }
      throw new InternalServerErrorException('Error al registrar en la lista de espera.');
    }
  }

  async findAll(): Promise<WaitingList[]> {
    const query = `
      SELECT * FROM scheduling.waiting_list 
      WHERE is_deleted = FALSE 
      ORDER BY schedule_id ASC, position ASC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<WaitingList> {
    const query = `
      SELECT * FROM scheduling.waiting_list 
      WHERE id = $1 AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Registro en lista de espera con ID '${id}' no encontrado.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateDto: UpdateWaitingListDto, userId?: string): Promise<WaitingList> {
    const current = await this.findOne(id);

    const schedule_id = updateDto.schedule_id ?? current.schedule_id;
    const user_id = updateDto.user_id ?? current.user_id;
    const waiting_status_id = updateDto.waiting_status_id ?? current.waiting_status_id;
    const position = updateDto.position ?? current.position;
    const notified_at = updateDto.notified_at ?? current.notified_at;
    const confirmation_deadline_at = updateDto.confirmation_deadline_at ?? current.confirmation_deadline_at;
    const confirmed_at = updateDto.confirmed_at ?? current.confirmed_at;
    const declined_at = updateDto.declined_at ?? current.declined_at;
    const cancelled_at = updateDto.cancelled_at ?? current.cancelled_at;
    const converted_at = updateDto.converted_at ?? current.converted_at;

    this.validateDates({
      notified_at: notified_at as string,
      confirmation_deadline_at: confirmation_deadline_at as string,
    });

    try {
      const query = `
        UPDATE scheduling.waiting_list 
        SET 
          schedule_id = $1,
          user_id = $2,
          waiting_status_id = $3,
          position = $4,
          notified_at = $5,
          confirmation_deadline_at = $6,
          confirmed_at = $7,
          declined_at = $8,
          cancelled_at = $9,
          converted_at = $10,
          updated_by = $11,
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        schedule_id,
        user_id,
        waiting_status_id,
        position,
        notified_at || null,
        confirmation_deadline_at || null,
        confirmed_at || null,
        declined_at || null,
        cancelled_at || null,
        converted_at || null,
        userId || null,
        id,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Conflicto de unicidad: el usuario ya está registrado o la posición ya está ocupada.');
      }
      if (error.code === '23503') {
        throw new NotFoundException('Alguna de las referencias especificadas no existe.');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Las fechas o la posición no cumplen con las reglas de validación.');
      }
      throw new InternalServerErrorException('Error al actualizar el registro en lista de espera.');
    }
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `
      UPDATE scheduling.waiting_list 
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    await this.db.query(query, [userId || null, id]);

    return { message: `Registro en lista de espera con ID '${id}' eliminado exitosamente.` };
  }
}