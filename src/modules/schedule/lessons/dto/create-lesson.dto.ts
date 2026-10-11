import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  max_students: number;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  instructor_ids?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  category_ids?: string[];
}
