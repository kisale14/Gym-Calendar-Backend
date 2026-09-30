CREATE TABLE IF NOT EXISTS seguridad.role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role_id
        FOREIGN KEY (role_id) REFERENCES seguridad.roles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_role_permissions_permission_id
        FOREIGN KEY (permission_id) REFERENCES seguridad.permissions(id) ON DELETE RESTRICT
);