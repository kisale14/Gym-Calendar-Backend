import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { BookingsController } from './bookings.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { AuthModule } from '../../iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [BookingsController],
  providers: [BookingsService, DatabaseService],
  exports: [BookingsService],
})
export class BookingsModule {}