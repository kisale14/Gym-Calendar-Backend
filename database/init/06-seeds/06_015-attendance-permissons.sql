-- Seed: Permisos para el módulo Attendance
INSERT INTO seguridad.permissions (name, description) VALUES
    ('attendance:create', 'Permite registrar la asistencia a una clase'),
    ('attendance:read', 'Permite consultar y listar los registros de asistencia'),
    ('attendance:update', 'Permite actualizar la información de asistencia o sus notas'),
    ('attendance:delete', 'Permite realizar un borrado lógico de un registro de asistencia')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'attendance:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;