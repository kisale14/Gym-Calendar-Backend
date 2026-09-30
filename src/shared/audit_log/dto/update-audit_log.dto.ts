import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditLogDto } from './create-audit_log.dto.js';

export class UpdateAuditLogDto extends PartialType(CreateAuditLogDto) {}
