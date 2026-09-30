import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGenderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}