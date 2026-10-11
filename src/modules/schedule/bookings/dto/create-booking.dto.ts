import { IsUUID, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;

  @IsUUID()
  @IsNotEmpty()
  booking_status_id: string;

  @IsDateString()
  @IsOptional()
  confirmed_at?: string;

  @IsDateString()
  @IsOptional()
  cancelled_at?: string;
}
