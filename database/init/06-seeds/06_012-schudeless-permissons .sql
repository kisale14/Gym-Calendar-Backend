-- Seed: Permisos para el módulo Schedules
INSERT INTO seguridad.permissions (name, description) VALUES
    ('schedules:create', 'Permite programar y crear nuevos horarios de clases'),
    ('schedules:read', 'Permite listar y consultar los horarios de clases'),
    ('schedules:update', 'Permite actualizar la programación de los horarios'),
    ('schedules:delete', 'Permite realizar un borrado lógico de un horario')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'schedules:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;