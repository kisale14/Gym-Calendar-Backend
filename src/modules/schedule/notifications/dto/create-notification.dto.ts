import {
  IsUUID,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;

  @IsUUID()
  @IsOptional()
  waiting_list_id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsDateString()
  @IsOptional()
  sent_at?: string;

  @IsDateString()
  @IsOptional()
  read_at?: string;
}
