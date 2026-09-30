CREATE TABLE IF NOT EXISTS shared.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    reason TEXT NULL,
    changed_by UUID NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record
    ON shared.audit_log (table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at
    ON shared.audit_log (changed_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by
    ON shared.audit_log (changed_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_version
    ON shared.audit_log (version);