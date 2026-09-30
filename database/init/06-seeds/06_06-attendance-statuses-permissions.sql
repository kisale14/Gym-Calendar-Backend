-- Seed: Permisos para el CRUD del módulo Attendance Statuses
INSERT INTO seguridad.permissions (name, description) VALUES
    ('attendance-statuses:create', 'Permite crear nuevos estados de asistencia'),
    ('attendance-statuses:read', 'Permite listar y consultar los estados de asistencia'),
    ('attendance-statuses:update', 'Permite actualizar la información de los estados de asistencia'),
    ('attendance-statuses:delete', 'Permite eliminar un estado de asistencia')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'attendance-statuses:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;