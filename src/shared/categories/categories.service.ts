import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, description, color, icon } = createCategoryDto;

    try {
      const query = `
        INSERT INTO shared.categories (name, description, color, icon)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const result = await this.db.query(query, [name, description, color, icon]);
      return result.rows[0];
    } catch (error: any) {
      // Manejo de error por violación de restricción UNIQUE en el nombre
      if (error.code === '23505') {
        throw new ConflictException(`La categoría con el nombre '${name}' ya existe.`);
      }
      throw new InternalServerErrorException('Error al crear la categoría.');
    }
  }

  async findAll(): Promise<Category[]> {
    const query = `SELECT * FROM shared.categories ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<Category> {
    const query = `SELECT * FROM shared.categories WHERE id = $1;`;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Categoría con ID '${id}' no encontrada.`);
    }

    return result.rows[0];
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Primero verificamos que exista
    await this.findOne(id);

    const { name, description, color, icon } = updateCategoryDto;

    try {
      const query = `
        UPDATE shared.categories 
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          color = COALESCE($3, color),
          icon = COALESCE($4, icon),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
      `;
      const result = await this.db.query(query, [name, description, color, icon, id]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe otra categoría con el nombre especificado.`);
      }
      throw new InternalServerErrorException('Error al actualizar la categoría.');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    const query = `DELETE FROM shared.categories WHERE id = $1;`;
    await this.db.query(query, [id]);

    return { message: `Categoría con ID '${id}' eliminada exitosamente.` };
  }
}