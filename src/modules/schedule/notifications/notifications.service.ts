import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';
import { Notification } from './entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const { user_id, schedule_id, waiting_list_id, type, subject, message, sent_at, read_at } = createDto;

    try {
      const query = `
        INSERT INTO scheduling.notifications (
          user_id, schedule_id, waiting_list_id, type, subject, message, sent_at, read_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP), $8)
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        user_id,
        schedule_id,
        waiting_list_id || null,
        type,
        subject,
        message,
        sent_at || null,
        read_at || null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        throw new NotFoundException('El usuario, el horario o el registro de la lista de espera especificado no existen.');
      }
      throw new InternalServerErrorException('Error al crear la notificación.');
    }
  }

  async findAll(): Promise<Notification[]> {
    const query = `
      SELECT * FROM scheduling.notifications 
      WHERE is_deleted = FALSE 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Notification> {
    const query = `
      SELECT * FROM scheduling.notifications 
      WHERE id = $1 AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Notificación con ID '${id}' no encontrada.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateDto: UpdateNotificationDto): Promise<Notification> {
    const current = await this.findOne(id);

    const user_id = updateDto.user_id ?? current.user_id;
    const schedule_id = updateDto.schedule_id ?? current.schedule_id;
    const waiting_list_id = updateDto.waiting_list_id ?? current.waiting_list_id;
    const type = updateDto.type ?? current.type;
    const subject = updateDto.subject ?? current.subject;
    const message = updateDto.message ?? current.message;
    const sent_at = updateDto.sent_at ?? current.sent_at;
    const read_at = updateDto.read_at ?? current.read_at;

    try {
      const query = `
        UPDATE scheduling.notifications 
        SET 
          user_id = $1,
          schedule_id = $2,
          waiting_list_id = $3,
          type = $4,
          subject = $5,
          message = $6,
          sent_at = $7,
          read_at = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        user_id,
        schedule_id,
        waiting_list_id || null,
        type,
        subject,
        message,
        sent_at,
        read_at || null,
        id,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23503') {
        throw new NotFoundException('Alguna de las referencias (usuario, horario o lista de espera) no es válida.');
      }
      throw new InternalServerErrorException('Error al actualizar la notificación.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `
      UPDATE scheduling.notifications 
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;
    await this.db.query(query, [id]);

    return { message: `Notificación con ID '${id}' eliminada exitosamente.` };
  }
}