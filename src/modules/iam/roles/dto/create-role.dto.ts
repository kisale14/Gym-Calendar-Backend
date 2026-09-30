import { IsString, IsNotEmpty, MaxLength, MinLength, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  name: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La descripción no puede superar los 255 caracteres' })
  description?: string;
}
