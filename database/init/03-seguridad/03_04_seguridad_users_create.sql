CREATE TABLE IF NOT EXISTS seguridad.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    date_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    phone VARCHAR(30),
    gender_id UUID NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by UUID NULL,
    created_by UUID NULL,
    updated_by UUID NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_gender_id
        FOREIGN KEY (gender_id) REFERENCES shared.genders(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON seguridad.users (email);

CREATE INDEX IF NOT EXISTS idx_users_username
    ON seguridad.users (username);

CREATE INDEX IF NOT EXISTS idx_users_gender_id
    ON seguridad.users (gender_id);

CREATE INDEX IF NOT EXISTS idx_users_lastname
    ON seguridad.users (lastname);

CREATE INDEX IF NOT EXISTS idx_users_is_deleted
    ON seguridad.users (is_deleted);

CREATE INDEX IF NOT EXISTS idx_users_version
    ON seguridad.users (version);