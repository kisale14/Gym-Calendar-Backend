import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { RolesController } from './roles.controller.js';
import { DatabaseService } from '../../../database/database.service.js';

@Module({
  controllers: [RolesController],
  providers: [RolesService, DatabaseService],
  exports: [DatabaseService]
})
export class RolesModule {}
