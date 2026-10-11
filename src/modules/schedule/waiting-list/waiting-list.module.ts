import { Module } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service.js';
import { WaitingListController } from './waiting-list.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { AuthModule } from '../../iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [WaitingListController],
  providers: [WaitingListService, DatabaseService],
  exports: [WaitingListService],
})
export class WaitingListModule {}
