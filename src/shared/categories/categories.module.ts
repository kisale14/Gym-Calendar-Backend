// src/shared/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CategoriesController } from './categories.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, DatabaseService],
  exports: [CategoriesService], 
})
export class CategoriesModule {}