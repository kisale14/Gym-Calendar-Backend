import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service.js';
import { LessonsController } from './lessons.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { AuthModule } from '../../iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [LessonsController],
  providers: [LessonsService, DatabaseService],
  exports: [LessonsService],
})
export class LessonsModule {}