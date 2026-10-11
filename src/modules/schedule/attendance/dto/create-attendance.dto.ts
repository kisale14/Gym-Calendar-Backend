import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  attendance_status_id: string;

  @IsDateString()
  @IsOptional()
  attended_at?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
