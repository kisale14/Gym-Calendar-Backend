import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { PermissionsController } from './permissions.controller.js';
import { DatabaseService } from '../../../database/database.service.js';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, DatabaseService],
  exports: [DatabaseService]
})
export class PermissionsModule {}
