import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateLessonsCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  lesson_id: string;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}
