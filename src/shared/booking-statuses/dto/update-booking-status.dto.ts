import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingStatusDto } from './create-booking-status.dto.js';

export class UpdateBookingStatusDto extends PartialType(
  CreateBookingStatusDto,
) {}
