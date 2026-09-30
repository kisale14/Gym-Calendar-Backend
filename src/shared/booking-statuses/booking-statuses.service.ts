import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateBookingStatusDto } from './dto/create-booking-status.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { BookingStatus } from './entities/booking-status.entity.js';

@Injectable()
export class BookingStatusesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createBookingStatusDto: CreateBookingStatusDto): Promise<BookingStatus> {
    const { code, name, description } = createBookingStatusDto;

    try {
      const query = `
        INSERT INTO shared.booking_statuses (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await this.db.query(query, [code, name, description]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un estado de reserva con el código o nombre especificado.`);
      }
      throw new InternalServerErrorException('Error al crear el estado de reserva.');
    }
  }

  async findAll(): Promise<BookingStatus[]> {
    const query = `SELECT * FROM shared.booking_statuses ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<BookingStatus> {
    const query = `SELECT * FROM shared.booking_statuses WHERE id = $1;`;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Estado de reserva con ID '${id}' no encontrado.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateBookingStatusDto: UpdateBookingStatusDto): Promise<BookingStatus> {
    await this.findOne(id);

    const { code, name, description } = updateBookingStatusDto;

    try {
      const query = `
        UPDATE shared.booking_statuses 
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
        throw new ConflictException(`Conflicto de unicidad: el código o nombre ya están registrados.`);
      }
      throw new InternalServerErrorException('Error al actualizar el estado de reserva.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `DELETE FROM shared.booking_statuses WHERE id = $1;`;
    await this.db.query(query, [id]);

    return { message: `Estado de reserva con ID '${id}' eliminado exitosamente.` };
  }
}