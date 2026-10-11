import { IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchLessonDto {
  /** Término de búsqueda por texto en nombre o descripción de la clase */
  @IsOptional()
  @IsString()
  q?: string;

  /** Filtrar por ID de categoría (UUID) */
  @IsOptional()
  @IsUUID('4', { message: 'categoryId debe ser un UUID válido.' })
  categoryId?: string;

  /** Filtrar por ID de instructor (UUID) */
  @IsOptional()
  @IsUUID('4', { message: 'instructorId debe ser un UUID válido.' })
  instructorId?: string;

  /** Número de página para paginación (default: 1) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  /** Cantidad de elementos por página (default: 10, máx: 100) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
