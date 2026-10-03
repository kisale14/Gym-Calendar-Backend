import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateLessonsInstructorDto {
  @IsUUID()
  @IsNotEmpty()
  lesson_id: string;

  @IsUUID()
  @IsNotEmpty()
  instructor_id: string;
}