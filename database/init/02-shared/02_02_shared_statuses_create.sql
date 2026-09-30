CREATE TABLE IF NOT EXISTS shared.statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context VARCHAR(30) NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (context, code),
    UNIQUE (context, name)
);