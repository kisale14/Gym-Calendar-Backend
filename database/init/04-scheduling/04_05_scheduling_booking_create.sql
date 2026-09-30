CREATE TABLE IF NOT EXISTS scheduling.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    booking_status_id UUID NOT NULL,
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_by UUID NULL,
    version INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, schedule_id),
    CONSTRAINT fk_bookings_user_id
        FOREIGN KEY (user_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_schedule_id
        FOREIGN KEY (schedule_id) REFERENCES scheduling.schedules(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_status_id
        FOREIGN KEY (booking_status_id) REFERENCES shared.booking_statuses(id) ON DELETE RESTRICT,
    CONSTRAINT chk_booking_status_dates CHECK (
        (booking_status_id IS NOT NULL) AND
        (
            (confirmed_at IS NULL AND cancelled_at IS NULL) OR
            (confirmed_at IS NOT NULL AND cancelled_at IS NULL) OR
            (confirmed_at IS NULL AND cancelled_at IS NOT NULL)
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id
    ON scheduling.bookings (schedule_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id
    ON scheduling.bookings (user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_booking_status_id
    ON scheduling.bookings (booking_status_id);

CREATE INDEX IF NOT EXISTS idx_bookings_schedule_status
    ON scheduling.bookings (schedule_id, booking_status_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user_status
    ON scheduling.bookings (user_id, booking_status_id);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
    ON scheduling.bookings (created_at);

CREATE INDEX IF NOT EXISTS idx_bookings_is_deleted
    ON scheduling.bookings (is_deleted);

CREATE INDEX IF NOT EXISTS idx_bookings_version
    ON scheduling.bookings (version);