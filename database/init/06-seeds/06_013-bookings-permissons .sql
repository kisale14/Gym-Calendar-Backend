-- Seed: Permisos para el módulo Bookings
INSERT INTO seguridad.permissions (name, description) VALUES
    ('bookings:create', 'Permite crear nuevas reservas de clases'),
    ('bookings:read', 'Permite listar y consultar las reservas'),
    ('bookings:update', 'Permite actualizar la información o estado de las reservas'),
    ('bookings:delete', 'Permite realizar un borrado lógico de una reserva')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'bookings:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;