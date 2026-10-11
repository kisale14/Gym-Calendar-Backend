import { Module } from '@nestjs/common';
import { GendersService } from './gender.service.js';
import { GendersController } from './gender.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  providers: [GendersService, DatabaseService],
  controllers: [GendersController],
})
export class GenderModule {}
