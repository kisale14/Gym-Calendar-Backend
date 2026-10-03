import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Booking } from './entities/booking.entity.js';

@Injectable()
export class BookingsService {
  constructor(private readonly db: DatabaseService) {}

  private validateBookingDates(confirmed_at?: string, cancelled_at?: string) {
    if (confirmed_at && cancelled_at) {
      throw new BadRequestException('Una reserva no puede estar confirmada y cancelada al mismo tiempo.');
    }
  }

  async create(createBookingDto: CreateBookingDto, userId?: string): Promise<Booking> {
    const { user_id, schedule_id, booking_status_id, confirmed_at, cancelled_at } = createBookingDto;

    this.validateBookingDates(confirmed_at, cancelled_at);

    try {
      const query = `
        INSERT INTO scheduling.bookings (
          user_id, schedule_id, booking_status_id, confirmed_at, cancelled_at, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        user_id,
        schedule_id,
        booking_status_id,
        confirmed_at || null,
        cancelled_at || null,
        userId || null,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El usuario ya tiene una reserva registrada para este horario.');
      }
      if (error.code === '23503') {
        throw new NotFoundException('El usuario, el horario o el estado de reserva especificado no existen.');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Las fechas de confirmación y cancelación no cumplen con las reglas de negocio.');
      }
      throw new InternalServerErrorException('Error al crear la reserva.');
    }
  }

  async findAll(): Promise<Booking[]> {
    const query = `
      SELECT * FROM scheduling.bookings 
      WHERE is_deleted = FALSE 
      ORDER BY created_at DESC;
    `;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Booking> {
    const query = `
      SELECT * FROM scheduling.bookings 
      WHERE id = $1 AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Reserva con ID '${id}' no encontrada.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId?: string): Promise<Booking> {
    const current = await this.findOne(id);

    const user_id = updateBookingDto.user_id ?? current.user_id;
    const schedule_id = updateBookingDto.schedule_id ?? current.schedule_id;
    const booking_status_id = updateBookingDto.booking_status_id ?? current.booking_status_id;
    const confirmed_at = updateBookingDto.confirmed_at ?? current.confirmed_at;
    const cancelled_at = updateBookingDto.cancelled_at ?? current.cancelled_at;

    this.validateBookingDates(confirmed_at as string, cancelled_at as string);

    try {
      const query = `
        UPDATE scheduling.bookings 
        SET 
          user_id = $1,
          schedule_id = $2,
          booking_status_id = $3,
          confirmed_at = $4,
          cancelled_at = $5,
          updated_by = $6,
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        user_id,
        schedule_id,
        booking_status_id,
        confirmed_at || null,
        cancelled_at || null,
        userId || null,
        id,
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe otra reserva para este usuario y horario.');
      }
      if (error.code === '23503') {
        throw new NotFoundException('Alguna de las referencias (usuario, horario o estado) no es válida.');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Las fechas de confirmación y cancelación no cumplen con las reglas de negocio.');
      }
      throw new InternalServerErrorException('Error al actualizar la reserva.');
    }
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `
      UPDATE scheduling.bookings 
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    await this.db.query(query, [userId || null, id]);

    return { message: `Reserva con ID '${id}' eliminada exitosamente.` };
  }
}