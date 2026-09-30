-- Seed: Permisos para la gestión de User Categories
INSERT INTO seguridad.permissions (name, description) VALUES
    ('user-categories:create', 'Permite asignar categorías a los usuarios'),
    ('user-categories:read', 'Permite consultar las categorías asociadas a un usuario'),
    ('user-categories:delete', 'Permite desvincular una categoría de un usuario')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'user-categories:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;