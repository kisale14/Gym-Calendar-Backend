// src/modules/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastname: string;

  @IsDateString()
  @IsNotEmpty()
  date_birth: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password_hash: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  image?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @IsUUID('4')
  @IsNotEmpty()
  gender_id: string;
}
