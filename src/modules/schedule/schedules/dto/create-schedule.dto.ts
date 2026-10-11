import {
  IsUUID,
  IsNotEmpty,
  IsDateString,
  IsString,
  Matches,
} from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  @IsNotEmpty()
  lesson_id: string;

  @IsDateString()
  @IsNotEmpty()
  event_date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message:
      'start_time debe tener un formato de hora válido (HH:mm o HH:mm:ss)',
  })
  start_time: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'end_time debe tener un formato de hora válido (HH:mm o HH:mm:ss)',
  })
  end_time: string;
}
