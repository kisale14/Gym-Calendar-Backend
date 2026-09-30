-- Seed: Permisos para el CRUD del módulo Categories
INSERT INTO seguridad.permissions (name, description) VALUES
    ('categories:create', 'Permite crear nuevas categorías'),
    ('categories:read', 'Permite listar y consultar las categorías'),
    ('categories:update', 'Permite actualizar la información de las categorías'),
    ('categories:delete', 'Permite eliminar una categoría')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'categories:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;