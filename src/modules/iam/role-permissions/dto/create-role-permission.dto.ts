import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateRolePermissionDto {
  @IsUUID('4', { message: 'El role_id debe ser un UUID válido' })
  @IsNotEmpty()
  role_id: string;

  @IsUUID('4', { message: 'El permission_id debe ser un UUID válido' })
  @IsNotEmpty()
  permission_id: string;
}
