CREATE TABLE IF NOT EXISTS seguridad.user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user_id
        FOREIGN KEY (user_id) REFERENCES seguridad.users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_role_id
        FOREIGN KEY (role_id) REFERENCES seguridad.roles(id) ON DELETE RESTRICT
);