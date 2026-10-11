import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { AssignCategoryToUserDto } from './dto/create-user_category.dto.js';
import { UserCategory } from './entities/user_category.entity.js';

@Injectable()
export class UserCategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async assignCategory(dto: AssignCategoryToUserDto): Promise<UserCategory> {
    const { user_id, category_id } = dto;

    try {
      const query = `
        INSERT INTO seguridad.user_categories (user_id, category_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const result = await this.db.query(query, [user_id, category_id]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'El usuario ya tiene asignada esta categoría.',
        );
      }
      if (error.code === '23503') {
        throw new NotFoundException(
          'El usuario o la categoría especificada no existen.',
        );
      }
      throw new InternalServerErrorException(
        'Error al asignar la categoría al usuario.',
      );
    }
  }

  async findCategoriesByUser(userId: string): Promise<any[]> {
    const query = `
      SELECT c.*, uc.created_at as assigned_at
      FROM shared.categories c
      INNER JOIN seguridad.user_categories uc ON c.id = uc.category_id
      WHERE uc.user_id = $1;
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  async removeCategoryFromUser(
    userId: string,
    categoryId: string,
  ): Promise<{ message: string }> {
    const query = `
      DELETE FROM seguridad.user_categories 
      WHERE user_id = $1 AND category_id = $2;
    `;
    const result = await this.db.query(query, [userId, categoryId]);

    if (result.rowCount === 0) {
      throw new NotFoundException(
        'La relación entre el usuario y la categoría no fue encontrada.',
      );
    }

    return { message: 'Categoría desvinculada del usuario exitosamente.' };
  }
}
