-- Seed: Permisos para el CRUD del módulo Waiting Statuses
INSERT INTO seguridad.permissions (name, description) VALUES
    ('waiting-statuses:create', 'Permite crear nuevos estados de espera'),
    ('waiting-statuses:read', 'Permite listar y consultar los estados de espera'),
    ('waiting-statuses:update', 'Permite actualizar la información de los estados de espera'),
    ('waiting-statuses:delete', 'Permite eliminar un estado de espera')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'waiting-statuses:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;