CREATE TABLE IF NOT EXISTS scheduling.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL,
    user_id UUID NOT NULL,
    attendance_status_id UUID NOT NULL,
    attended_at TIMESTAMP NULL,
    notes TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_by UUID NULL,
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (schedule_id, user_id),
    CONSTRAINT fk_attendance_schedule_id
        FOREIGN KEY (schedule_id) REFERENCES scheduling.schedules(id) ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_user_id
        FOREIGN KEY (user_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_attendance_status_id
        FOREIGN KEY (attendance_status_id) REFERENCES shared.attendance_statuses(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_attendance_schedule_id
    ON scheduling.attendance (schedule_id);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id
    ON scheduling.attendance (user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_status_id
    ON scheduling.attendance (attendance_status_id);

CREATE INDEX IF NOT EXISTS idx_attendance_schedule_status
    ON scheduling.attendance (schedule_id, attendance_status_id);

CREATE INDEX IF NOT EXISTS idx_attendance_user_status
    ON scheduling.attendance (user_id, attendance_status_id);

CREATE INDEX IF NOT EXISTS idx_attendance_attended_at
    ON scheduling.attendance (attended_at);

CREATE INDEX IF NOT EXISTS idx_attendance_is_deleted
    ON scheduling.attendance (is_deleted);

CREATE INDEX IF NOT EXISTS idx_attendance_version
    ON scheduling.attendance (version);