import { Module } from '@nestjs/common';
import { StatusesService } from './statuses.service.js';
import { StatusesController } from './statuses.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [StatusesController],
  providers: [StatusesService, DatabaseService],
  exports: [StatusesService],
})
export class StatusesModule {}