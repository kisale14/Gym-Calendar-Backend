import { Module } from '@nestjs/common';
import { WaitingStatusesService } from './waiting-statuses.service.js';
import { WaitingStatusesController } from './waiting-statuses.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [WaitingStatusesController],
  providers: [WaitingStatusesService, DatabaseService],
  exports: [WaitingStatusesService],
})
export class WaitingStatusesModule {}
