// src/shared/attendance-statuses/attendance-statuses.module.ts
import { Module } from '@nestjs/common';
import { AttendanceStatusesService } from './attendance-statuses.service.js';
import { AttendanceStatusesController } from './attendance-statuses.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AttendanceStatusesController],
  providers: [AttendanceStatusesService, DatabaseService],
  exports: [AttendanceStatusesService],
})
export class AttendanceStatusesModule {}
