-- Seed: Permisos para el módulo Audit Log (Enfocado principalmente en lectura y consulta de trazabilidad)
INSERT INTO seguridad.permissions (name, description) VALUES
    ('audit-logs:read', 'Permite consultar el historial de auditoría y trazabilidad del sistema')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'audit-logs:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;