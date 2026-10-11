import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CheckUsernameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres.' })
  @MaxLength(50, { message: 'El username no puede superar los 50 caracteres.' })
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'El username solo puede contener letras, números, puntos, guiones y guiones bajos.',
  })
  username: string;
}
