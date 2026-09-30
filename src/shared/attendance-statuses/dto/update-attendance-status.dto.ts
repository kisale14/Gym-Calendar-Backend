import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceStatusDto } from './create-attendance-status.dto.js';

export class UpdateAttendanceStatusDto extends PartialType(CreateAttendanceStatusDto) {}
