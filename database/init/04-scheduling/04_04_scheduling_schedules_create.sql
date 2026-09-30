CREATE TABLE IF NOT EXISTS scheduling.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL,
    instructor_id UUID NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by UUID NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedules_lesson_instructor
        FOREIGN KEY (lesson_id, instructor_id)
        REFERENCES scheduling.lessons_instructors(lesson_id, instructor_id) ON DELETE RESTRICT,
    CONSTRAINT chk_schedule_times CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_schedules_event_date
    ON scheduling.schedules (event_date);

CREATE INDEX IF NOT EXISTS idx_schedules_instructor_id
    ON scheduling.schedules (instructor_id);

CREATE INDEX IF NOT EXISTS idx_schedules_lesson_id
    ON scheduling.schedules (lesson_id);

CREATE INDEX IF NOT EXISTS idx_schedules_event_date_start_time
    ON scheduling.schedules (event_date, start_time);

CREATE INDEX IF NOT EXISTS idx_schedules_instructor_event_date
    ON scheduling.schedules (instructor_id, event_date);

CREATE INDEX IF NOT EXISTS idx_schedules_is_deleted
    ON scheduling.schedules (is_deleted);

CREATE INDEX IF NOT EXISTS idx_schedules_version
    ON scheduling.schedules (version);