// src/modules/iam/user-categories/user-categories.module.ts
import { Module } from '@nestjs/common';
import { UserCategoriesService } from './user_categories.service.js';
import { UserCategoriesController } from './user_categories.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [UserCategoriesController],
  providers: [UserCategoriesService, DatabaseService],
  exports: [UserCategoriesService],
})
export class UserCategoriesModule {}
