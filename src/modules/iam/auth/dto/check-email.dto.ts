import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CheckEmailDto {
  @IsEmail({}, { message: 'El valor proporcionado no es un email válido.' })
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}
