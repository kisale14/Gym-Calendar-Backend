// src/shared/audit-log/audit-log.controller.ts
import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AuditLogService } from './audit_log.service.js';
import { AuditLog } from './entities/audit_log.entity.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions('audit-logs:read')
  findAll(): Promise<AuditLog[]> {
    return this.auditLogService.findAll();
  }

  @Get(':id')
  @RequirePermissions('audit-logs:read')
  findOne(@Param('id') id: string): Promise<AuditLog> {
    return this.auditLogService.findOne(id);
  }

  @Get('record/:tableName/:recordId')
  @RequirePermissions('audit-logs:read')
  findByTableAndRecord(
    @Param('tableName') tableName: string,
    @Param('recordId') recordId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByTableAndRecord(tableName, recordId);
  }
}
