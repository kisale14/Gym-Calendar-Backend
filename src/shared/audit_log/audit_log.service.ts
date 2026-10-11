// src/shared/audit-log/audit-log.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CreateAuditLogDto } from './dto/create-audit_log.dto.js';
import { AuditLog } from './entities/audit_log.entity.js';

@Injectable()
export class AuditLogService {
  constructor(private readonly db: DatabaseService) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const {
      table_name,
      record_id,
      action,
      reason,
      changed_by,
      old_values,
      new_values,
      version,
    } = createAuditLogDto;

    try {
      const query = `
        INSERT INTO shared.audit_log (table_name, record_id, action, reason, changed_by, old_values, new_values, version)
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 1))
        RETURNING *;
      `;
      const result = await this.db.query(query, [
        table_name,
        record_id,
        action,
        reason || null,
        changed_by || null,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        version || 1,
      ]);
      return result.rows[0];
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error al registrar la auditoría.',
      );
    }
  }

  async findAll(): Promise<AuditLog[]> {
    const query = `SELECT * FROM shared.audit_log ORDER BY changed_at DESC LIMIT 100;`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findOne(id: string): Promise<AuditLog> {
    const query = `SELECT * FROM shared.audit_log WHERE id = $1;`;
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException(
        `Registro de auditoría con ID '${id}' no encontrado.`,
      );
    }

    return result.rows[0];
  }

  async findByTableAndRecord(
    tableName: string,
    recordId: string,
  ): Promise<AuditLog[]> {
    const query = `
      SELECT * FROM shared.audit_log 
      WHERE table_name = $1 AND record_id = $2 
      ORDER BY changed_at DESC;
    `;
    const result = await this.db.query(query, [tableName, recordId]);
    return result.rows;
  }
}
