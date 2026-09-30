-- Seed: Permisos para el CRUD del módulo Statuses
INSERT INTO seguridad.permissions (name, description) VALUES
    ('statuses:create', 'Permite crear nuevos estados'),
    ('statuses:read', 'Permite listar y consultar los estados'),
    ('statuses:update', 'Permite actualizar la información de los estados'),
    ('statuses:delete', 'Permite eliminar un estado')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'statuses:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;