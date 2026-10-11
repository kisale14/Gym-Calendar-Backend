import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateWaitingStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
