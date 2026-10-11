import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonsCategoryDto } from './create-lessons-category.dto.js';

export class UpdateLessonsCategoryDto extends PartialType(
  CreateLessonsCategoryDto,
) {}
