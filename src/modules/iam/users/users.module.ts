import { Module } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, DatabaseService],
})
export class UsersModule {}
