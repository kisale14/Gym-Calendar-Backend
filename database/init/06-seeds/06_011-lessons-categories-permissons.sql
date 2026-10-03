-- Seed: Permisos para el módulo Lessons Categories
INSERT INTO seguridad.permissions (name, description) VALUES
    ('lessons_categories:create', 'Permite asignar una categoría a una clase'),
    ('lessons_categories:read', 'Permite consultar las categorías asociadas a las clases'),
    ('lessons_categories:delete', 'Permite desvincular una categoría de una clase')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'lessons_categories:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;