import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignCategoryToUserDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}