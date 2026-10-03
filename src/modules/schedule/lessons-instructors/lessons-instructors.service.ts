import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { CreateLessonsInstructorDto } from './dto/create-lessons-instructor.dto.js';
import { LessonsInstructor } from './entities/lessons-instructor.entity.js';

@Injectable()
export class LessonsInstructorsService {
  constructor(private readonly db: DatabaseService) {}

  async assignInstructor(createDto: CreateLessonsInstructorDto): Promise<LessonsInstructor> {
    const { lesson_id, instructor_id } = createDto;

    try {
      const query = `
        INSERT INTO scheduling.lessons_instructors (lesson_id, instructor_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const result = await this.db.query(query, [lesson_id, instructor_id]);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Violación de llave primaria (duplicado)
        throw new ConflictException('El instructor ya está asignado a esta clase.');
      }
      if (error.code === '23503') { // Violación de llave foránea
        throw new NotFoundException('La clase o el instructor especificado no existen.');
      }
      throw new InternalServerErrorException('Error al asignar el instructor a la clase.');
    }
  }

  async findAll(): Promise<LessonsInstructor[]> {
    const query = `SELECT * FROM scheduling.lessons_instructors ORDER BY created_at DESC;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findByLesson(lessonId: string): Promise<any[]> {
    const query = `
      li.*, u.name as instructor_name, u.email as instructor_email
      FROM scheduling.lessons_instructors li
      JOIN seguridad.users u ON li.instructor_id = u.id
      WHERE li.lesson_id = $1;
    `;
    // Nota: Asegúrate de adaptar la consulta según las columnas reales de tu tabla de usuarios en iam
    const result = await this.db.query(`
      SELECT li.lesson_id, li.instructor_id, li.created_at
      FROM scheduling.lessons_instructors li
      WHERE li.lesson_id = $1
    `, [lessonId]);
    return result.rows;
  }

  async remove(lessonId: string, instructorId: string): Promise<{ message: string }> {
    const query = `
      DELETE FROM scheduling.lessons_instructors 
      WHERE lesson_id = $1 AND instructor_id = $2
      RETURNING *;
    `;
    const result = await this.db.query(query, [lessonId, instructorId]);

    if (result.rows.length === 0) {
      throw new NotFoundException('La relación entre la clase y el instructor no fue encontrada.');
    }

    return { message: 'Instructor desasignado de la clase exitosamente.' };
  }
}