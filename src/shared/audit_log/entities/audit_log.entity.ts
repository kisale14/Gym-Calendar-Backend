export class AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  reason?: string;
  changed_by?: string;
  changed_at: Date;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  version: number;
  created_at: Date;
  updated_at: Date;
}
