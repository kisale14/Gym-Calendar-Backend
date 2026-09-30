CREATE TABLE IF NOT EXISTS scheduling.waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL,
    user_id UUID NOT NULL,
    waiting_status_id UUID NOT NULL,
    position INTEGER NOT NULL,
    notified_at TIMESTAMP NULL,
    confirmation_deadline_at TIMESTAMP NULL,
    confirmed_at TIMESTAMP NULL,
    declined_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_by UUID NULL,
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (schedule_id, user_id),
    UNIQUE (schedule_id, position),
    CONSTRAINT fk_waiting_list_schedule_id
        FOREIGN KEY (schedule_id) REFERENCES scheduling.schedules(id) ON DELETE RESTRICT,
    CONSTRAINT fk_waiting_list_user_id
        FOREIGN KEY (user_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_waiting_list_status_id
        FOREIGN KEY (waiting_status_id) REFERENCES shared.waiting_statuses(id) ON DELETE RESTRICT,
    CONSTRAINT chk_waiting_list_position CHECK (position > 0),
    CONSTRAINT chk_waiting_list_status_dates CHECK (
        (
            (notified_at IS NULL AND confirmation_deadline_at IS NULL AND confirmed_at IS NULL AND declined_at IS NULL AND cancelled_at IS NULL AND converted_at IS NULL)
            OR
            (notified_at IS NOT NULL AND confirmation_deadline_at IS NOT NULL)
        )
        AND
        (
            (confirmed_at IS NULL OR declined_at IS NULL OR cancelled_at IS NULL OR converted_at IS NULL)
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_waiting_list_schedule_id
    ON scheduling.waiting_list (schedule_id);

CREATE INDEX IF NOT EXISTS idx_waiting_list_user_id
    ON scheduling.waiting_list (user_id);

CREATE INDEX IF NOT EXISTS idx_waiting_list_waiting_status_id
    ON scheduling.waiting_list (waiting_status_id);

CREATE INDEX IF NOT EXISTS idx_waiting_list_schedule_status
    ON scheduling.waiting_list (schedule_id, waiting_status_id);

CREATE INDEX IF NOT EXISTS idx_waiting_list_position
    ON scheduling.waiting_list (schedule_id, position);

CREATE INDEX IF NOT EXISTS idx_waiting_list_confirmation_deadline
    ON scheduling.waiting_list (confirmation_deadline_at);

CREATE INDEX IF NOT EXISTS idx_waiting_list_is_deleted
    ON scheduling.waiting_list (is_deleted);

CREATE INDEX IF NOT EXISTS idx_waiting_list_version
    ON scheduling.waiting_list (version);