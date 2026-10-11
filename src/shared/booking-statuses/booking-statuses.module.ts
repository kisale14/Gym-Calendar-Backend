import { Module } from '@nestjs/common';
import { BookingStatusesService } from './booking-statuses.service.js';
import { BookingStatusesController } from './booking-statuses.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [BookingStatusesController],
  providers: [BookingStatusesService, DatabaseService],
  exports: [BookingStatusesService],
})
export class BookingStatusesModule {}
