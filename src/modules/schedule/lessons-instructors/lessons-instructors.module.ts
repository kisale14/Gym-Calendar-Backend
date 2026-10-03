import { Module } from '@nestjs/common';
import { LessonsInstructorsService } from './lessons-instructors.service.js';
import { LessonsInstructorsController } from './lessons-instructors.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { AuthModule } from '../../iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [LessonsInstructorsController],
  providers: [LessonsInstructorsService, DatabaseService],
  exports: [LessonsInstructorsService],
})
export class LessonsInstructorsModule {}