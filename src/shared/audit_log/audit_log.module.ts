// src/shared/audit-log/audit-log.module.ts
import { Module } from '@nestjs/common';
import { AuditLogService } from './audit_log.service.js';
import { AuditLogController } from './audit_log.controller.js';
import { DatabaseService } from '../../database/database.service.js';
import { AuthModule } from '../../modules/iam/auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, DatabaseService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
