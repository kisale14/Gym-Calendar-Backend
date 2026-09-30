import { Module } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service.js';
import { RolePermissionsController } from './role-permissions.controller.js';
import { DatabaseService } from '../../../database/database.service.js';

@Module({
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService, DatabaseService], 
  exports: [DatabaseService],
})
export class RolePermissionsModule {}