import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { Lesson } from './entities/lesson.entity.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class LessonsService {
  constructor(private readonly db: DatabaseService) {}

  async create(createLessonDto: CreateLessonDto, userId?: string): Promise<Lesson> {
    const { name, description, max_students } = createLessonDto;

    try {
      const query = `
        INSERT INTO scheduling.lessons (name, description, max_students, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $4)
        RETURNING *;
      `;
      const result = await this.db.query(query, [name, description || null, max_students, userId || null]);
      return result.rows[0];
    } catch (error: any) {
      throw new InternalServerErrorException('Error al crear la clase.');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<PaginatedResult<Lesson>> {

    const currentPage = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));
    const offset = (currentPage - 1) * itemsPerPage;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM scheduling.lessons
      WHERE is_deleted = FALSE;
    `;
    const countResult = await this.db.query(countQuery);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataQuery = `
      SELECT * FROM scheduling.lessons
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await this.db.query(dataQuery, [itemsPerPage, offset]);

    const totalPages = Math.ceil(total / itemsPerPage);

    return {
      data: result.rows,
      meta: {
        total,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: totalPages === 0 ? 1 : totalPages     
      }
    }
  }

  async findOne(id: string): Promise<Lesson> {
    const query = `
      SELECT * FROM scheduling.lessons 
      WHERE id = $1 AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Clase con ID '${id}' no encontrada.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, userId?: string): Promise<Lesson> {
    await this.findOne(id);

    const { name, description, max_students } = updateLessonDto;

    try {
      const query = `
        UPDATE scheduling.lessons 
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          max_students = COALESCE($3, max_students),
          updated_by = $4,
          version = version + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [name, description, max_students, userId || null, id]);
      return result.rows[0];
    } catch (error: any) {
      throw new InternalServerErrorException('Error al actualizar la clase.');
    }
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `
      UPDATE scheduling.lessons 
      SET 
        is_deleted = TRUE,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    await this.db.query(query, [userId || null, id]);

    return { message: `Clase con ID '${id}' eliminada exitosamente.` };
  }
}