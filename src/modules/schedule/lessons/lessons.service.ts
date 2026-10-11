import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { SearchLessonDto } from './dto/search-lesson.dto.js';
import { Lesson } from './entities/lesson.entity.js';
import { FileUploadService } from './file-upload.service.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean; // true cuando hay más páginas — usado para infinite scroll
  };
}

@Injectable()
export class LessonsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async create(
    createLessonDto: CreateLessonDto,
    userId?: string,
    imageFile?: Express.Multer.File,
    pdfFile?: Express.Multer.File,
  ): Promise<Lesson> {
    const { name, description, max_students, instructor_ids, category_ids } =
      createLessonDto;

    // Obtener rutas relativas si se subieron archivos
    const imageUrl = imageFile
      ? this.fileUploadService.getRelativePath('images', imageFile.filename)
      : null;
    const pdfUrl = pdfFile
      ? this.fileUploadService.getRelativePath('pdfs', pdfFile.filename)
      : null;

    try {
      // 1. Ejecutar inserciones dentro de una transacción atómica
      const lessonId = await this.db.transaction(async (client) => {
        // Insertar la clase
        const insertLessonQuery = `
          INSERT INTO scheduling.lessons (name, description, max_students, image_url, pdf_url, created_by, updated_by)
          VALUES ($1, $2, $3, $4, $5, $6, $6)
          RETURNING id;
        `;
        const lessonResult = await client.query(insertLessonQuery, [
          name,
          description || null,
          max_students,
          imageUrl,
          pdfUrl,
          userId || null,
        ]);
        const newLessonId = lessonResult.rows[0].id;

        // Insertar instructores
        if (instructor_ids && instructor_ids.length > 0) {
          const insertInstructorsQuery = `
            INSERT INTO scheduling.lessons_instructors (lesson_id, instructor_id)
            VALUES ($1, $2);
          `;
          for (const instructorId of instructor_ids) {
            await client.query(insertInstructorsQuery, [
              newLessonId,
              instructorId,
            ]);
          }
        }

        // Insertar categorías
        if (category_ids && category_ids.length > 0) {
          const insertCategoriesQuery = `
            INSERT INTO scheduling.lessons_categories (lesson_id, category_id)
            VALUES ($1, $2);
          `;
          for (const categoryId of category_ids) {
            await client.query(insertCategoriesQuery, [
              newLessonId,
              categoryId,
            ]);
          }
        }

        return newLessonId;
      });

      // 2. Retornar la clase enriquecida (incluyendo sus instructores y categorías)
      return this.findOne(lessonId);
    } catch (error: any) {
      // Si la transacción falla, eliminar los archivos subidos para no dejar huérfanos
      this.fileUploadService.deleteFile(imageUrl);
      this.fileUploadService.deleteFile(pdfUrl);

      if (error.code === '23503') {
        throw new InternalServerErrorException(
          'Uno de los instructores o categorías proporcionados no existe.',
        );
      }
      throw new InternalServerErrorException(
        'Error al crear la clase y asignar relaciones.',
      );
    }
  }

  async findAll(
    searchDto: SearchLessonDto = {},
  ): Promise<PaginatedResult<Lesson>> {
    const { q, categoryId, instructorId, page = 1, limit = 10 } = searchDto;

    const currentPage = Math.max(1, Number(page) || 1);
    const itemsPerPage = Math.max(1, Number(limit) || 10);
    const offset = (currentPage - 1) * itemsPerPage;

    // Filtros dinámicos con parámetros seguros para evitar SQL Injection
    const conditions: string[] = ['l.is_deleted = FALSE'];
    const filterParams: any[] = [];

    // Búsqueda por texto en nombre o descripción
    if (q && q.trim() !== '') {
      filterParams.push(`%${q.trim()}%`);
      const paramIdx = filterParams.length;
      conditions.push(
        `(l.name ILIKE $${paramIdx} OR l.description ILIKE $${paramIdx})`,
      );
    }

    // Filtro por categoría mediante EXISTS (evita romper json_agg en el SELECT)
    if (categoryId) {
      filterParams.push(categoryId);
      const paramIdx = filterParams.length;
      conditions.push(`
        EXISTS (
          SELECT 1 FROM scheduling.lessons_categories lc_filter
          WHERE lc_filter.lesson_id = l.id AND lc_filter.category_id = $${paramIdx}
        )
      `);
    }

    // Filtro por instructor mediante EXISTS (evita romper json_agg en el SELECT)
    if (instructorId) {
      filterParams.push(instructorId);
      const paramIdx = filterParams.length;
      conditions.push(`
        EXISTS (
          SELECT 1 FROM scheduling.lessons_instructors li_filter
          WHERE li_filter.lesson_id = l.id AND li_filter.instructor_id = $${paramIdx}
        )
      `);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Conteo total con los filtros aplicados
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM scheduling.lessons l
      ${whereClause};
    `;
    const countResult = await this.db.query(countQuery, filterParams);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // 2. Consulta de datos paginados
    const dataParams = [...filterParams, itemsPerPage, offset];
    const limitIndex = dataParams.length - 1;
    const offsetIndex = dataParams.length;

    // Consulta enriquecida con instructores y categorías agrupados via json_agg
    const dataQuery = `
      SELECT
        l.id,
        l.name,
        l.description,
        l.max_students,
        l.image_url,
        l.pdf_url,
        l.version,
        l.created_by,
        l.updated_by,
        l.created_at,
        l.updated_at,

        -- Instructores agrupados como array de objetos JSON
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id',       u.id,
              'name',     u.name,
              'lastname', u.lastname,
              'email',    u.email,
              'image',    u.image
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS instructors,

        -- Categorías agrupadas como array de objetos JSON
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id',          c.id,
              'name',        c.name,
              'description', c.description,
              'color',       c.color,
              'icon',        c.icon
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories

      FROM scheduling.lessons l
      LEFT JOIN scheduling.lessons_instructors li ON l.id = li.lesson_id
      LEFT JOIN seguridad.users u ON li.instructor_id = u.id AND u.is_deleted = FALSE
      LEFT JOIN scheduling.lessons_categories lc ON l.id = lc.lesson_id
      LEFT JOIN shared.categories c ON lc.category_id = c.id

      ${whereClause}
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex};
    `;
    const result = await this.db.query(dataQuery, dataParams);

    const totalPages = Math.ceil(total / itemsPerPage);
    const safeTotalPages = totalPages === 0 ? 1 : totalPages;

    return {
      data: result.rows,
      meta: {
        total,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: safeTotalPages,
        hasNextPage: currentPage < safeTotalPages,
      },
    };
  }

  async findOne(id: string): Promise<Lesson> {
    // Enriquecido con instructores y categorías igual que findAll
    const query = `
      SELECT
        l.id,
        l.name,
        l.description,
        l.max_students,
        l.image_url,
        l.pdf_url,
        l.version,
        l.created_by,
        l.updated_by,
        l.created_at,
        l.updated_at,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id',       u.id,
              'name',     u.name,
              'lastname', u.lastname,
              'email',    u.email,
              'image',    u.image
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS instructors,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id',          c.id,
              'name',        c.name,
              'description', c.description,
              'color',       c.color,
              'icon',        c.icon
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories

      FROM scheduling.lessons l
      LEFT JOIN scheduling.lessons_instructors li ON l.id = li.lesson_id
      LEFT JOIN seguridad.users u ON li.instructor_id = u.id AND u.is_deleted = FALSE
      LEFT JOIN scheduling.lessons_categories lc ON l.id = lc.lesson_id
      LEFT JOIN shared.categories c ON lc.category_id = c.id

      WHERE l.id = $1 AND l.is_deleted = FALSE
      GROUP BY l.id;
    `;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Clase con ID '${id}' no encontrada.`);
    }

    return result.rows[0];
  }

  async update(
    id: string,
    updateLessonDto: UpdateLessonDto,
    userId?: string,
    imageFile?: Express.Multer.File,
    pdfFile?: Express.Multer.File,
  ): Promise<Lesson> {
    // Verificar existencia y obtener archivos actuales
    const existing = await this.findOne(id);

    const { name, description, max_students } = updateLessonDto;

    // Rutas de nuevos archivos (si se enviaron)
    const newImageUrl = imageFile
      ? this.fileUploadService.getRelativePath('images', imageFile.filename)
      : undefined;
    const newPdfUrl = pdfFile
      ? this.fileUploadService.getRelativePath('pdfs', pdfFile.filename)
      : undefined;

    try {
      const query = `
        UPDATE scheduling.lessons 
        SET 
          name        = COALESCE($1, name),
          description = COALESCE($2, description),
          max_students = COALESCE($3, max_students),
          image_url   = COALESCE($4, image_url),
          pdf_url     = COALESCE($5, pdf_url),
          updated_by  = $6,
          version     = version + 1,
          updated_at  = CURRENT_TIMESTAMP
        WHERE id = $7 AND is_deleted = FALSE
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        name ?? null,
        description ?? null,
        max_students ?? null,
        newImageUrl ?? null,
        newPdfUrl ?? null,
        userId || null,
        id,
      ]);

      // Si la actualización fue exitosa y se subieron nuevos archivos,
      // eliminar los anteriores para no dejar archivos huérfanos
      if (result.rows.length > 0) {
        if (newImageUrl && existing.image_url) {
          this.fileUploadService.deleteFile(existing.image_url);
        }
        if (newPdfUrl && existing.pdf_url) {
          this.fileUploadService.deleteFile(existing.pdf_url);
        }
      }

      return result.rows[0];
    } catch (error: any) {
      // Si el UPDATE falla, eliminar los archivos nuevos subidos
      this.fileUploadService.deleteFile(newImageUrl);
      this.fileUploadService.deleteFile(newPdfUrl);
      throw new InternalServerErrorException('Error al actualizar la clase.');
    }
  }

  async remove(id: string, userId?: string): Promise<{ message: string }> {
    // Obtener archivos actuales antes de hacer soft-delete
    const existing = await this.findOne(id);

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

    // Eliminar archivos físicos asociados
    this.fileUploadService.deleteFile(existing.image_url);
    this.fileUploadService.deleteFile(existing.pdf_url);

    return { message: `Clase con ID '${id}' eliminada exitosamente.` };
  }
}
