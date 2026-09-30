import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateUserRoleDto {
  @IsUUID('4')
  @IsNotEmpty()
  user_id: string;

  @IsUUID('4')
  @IsNotEmpty()
  role_id: string;
}