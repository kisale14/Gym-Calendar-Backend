import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateWaitingListDto {
  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  waiting_status_id: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  position: number;

  @IsDateString()
  @IsOptional()
  notified_at?: string;

  @IsDateString()
  @IsOptional()
  confirmation_deadline_at?: string;

  @IsDateString()
  @IsOptional()
  confirmed_at?: string;

  @IsDateString()
  @IsOptional()
  declined_at?: string;

  @IsDateString()
  @IsOptional()
  cancelled_at?: string;

  @IsDateString()
  @IsOptional()
  converted_at?: string;
}
