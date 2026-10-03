-- Seed: Permisos para el módulo Notifications
INSERT INTO seguridad.permissions (name, description) VALUES
    ('notifications:create', 'Permite crear o enviar notificaciones a los usuarios'),
    ('notifications:read', 'Permite consultar y listar las notificaciones del sistema'),
    ('notifications:update', 'Permite actualizar el estado de lectura u otros detalles de la notificación'),
    ('notifications:delete', 'Permite realizar un borrado lógico de una notificación')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'notifications:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;