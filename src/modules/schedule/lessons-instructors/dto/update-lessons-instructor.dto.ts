import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonsInstructorDto } from './create-lessons-instructor.dto.js';

export class UpdateLessonsInstructorDto extends PartialType(
  CreateLessonsInstructorDto,
) {}
