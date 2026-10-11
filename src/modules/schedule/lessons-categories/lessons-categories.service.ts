import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateLessonsCategoryDto } from './dto/create-lessons-category.dto.js';
import { LessonsCategory } from './entities/lessons-category.entity.js';

@Injectable()
export class LessonsCategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async assignCategory(
    createDto: CreateLessonsCategoryDto,
  ): Promise<LessonsCategory> {
    const { lesson_id, category_id } = createDto;

    try {
      const query = `
        INSERT INTO scheduling.lessons_categories (lesson_id, category_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const result = await this.db.query(query, [lesson_id, category_id]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'La clase ya tiene asignada esta categoría.',
        );
      }
      if (error.code === '23503') {
        throw new NotFoundException(
          'La clase o la categoría especificada no existen.',
        );
      }
      throw new InternalServerErrorException(
        'Error al asignar la categoría a la clase.',
      );
    }
  }

  async findAll(): Promise<LessonsCategory[]> {
    const query = `SELECT * FROM scheduling.lessons_categories ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findCategoriesByLesson(lessonId: string): Promise<any[]> {
    const query = `
      SELECT c.*, lc.created_at as assigned_at
      FROM shared.categories c
      JOIN scheduling.lessons_categories lc ON c.id = lc.category_id
      WHERE lc.lesson_id = $1;
    `;
    const result = await this.db.query(query, [lessonId]);
    return result.rows;
  }

  async remove(
    lessonId: string,
    categoryId: string,
  ): Promise<{ message: string }> {
    const query = `
      DELETE FROM scheduling.lessons_categories 
      WHERE lesson_id = $1 AND category_id = $2
      RETURNING *;
    `;
    const result = await this.db.query(query, [lessonId, categoryId]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'La relación entre la clase y la categoría no fue encontrada.',
      );
    }

    return { message: 'Categoría desvinculada de la clase exitosamente.' };
  }
}
