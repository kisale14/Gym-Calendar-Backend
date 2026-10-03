import { Module } from '@nestjs/common';
import { LessonsCategoriesService } from './lessons-categories.service.js';
import { LessonsCategoriesController } from './lessons-categories.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { AuthModule } from '../../iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [LessonsCategoriesController],
  providers: [LessonsCategoriesService, DatabaseService],
  exports: [LessonsCategoriesService],
})
export class LessonsCategoriesModule {}