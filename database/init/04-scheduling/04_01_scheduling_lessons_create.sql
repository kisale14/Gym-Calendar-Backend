CREATE TABLE IF NOT EXISTS scheduling.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    max_students INTEGER NOT NULL DEFAULT 0 CHECK (max_students >= 0),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by UUID NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lessons_is_deleted
    ON scheduling.lessons (is_deleted);

CREATE INDEX IF NOT EXISTS idx_lessons_version
    ON scheduling.lessons (version);