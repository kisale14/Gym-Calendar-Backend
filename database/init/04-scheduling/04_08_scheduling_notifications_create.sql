CREATE TABLE IF NOT EXISTS scheduling.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    schedule_id UUID NOT NULL,
    waiting_list_id UUID NULL,
    type VARCHAR(30) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user_id
        FOREIGN KEY (user_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_notifications_schedule_id
        FOREIGN KEY (schedule_id) REFERENCES scheduling.schedules(id) ON DELETE RESTRICT,
    CONSTRAINT fk_notifications_waiting_list_id
        FOREIGN KEY (waiting_list_id) REFERENCES scheduling.waiting_list(id) ON DELETE RESTRICT
);