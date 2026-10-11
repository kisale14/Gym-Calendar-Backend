import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';
import { UserRolesController } from './user-roles.controller.js';
import { DatabaseService } from '../../../database/database.service.js';

@Module({
  controllers: [UserRolesController],
  providers: [UserRolesService, DatabaseService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
