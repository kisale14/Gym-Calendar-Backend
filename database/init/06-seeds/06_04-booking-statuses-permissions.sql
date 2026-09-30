-- Seed: Permisos para el CRUD del módulo Booking Statuses
INSERT INTO seguridad.permissions (name, description) VALUES
    ('booking-statuses:create', 'Permite crear nuevos estados de reserva'),
    ('booking-statuses:read', 'Permite listar y consultar los estados de reserva'),
    ('booking-statuses:update', 'Permite actualizar la información de los estados de reserva'),
    ('booking-statuses:delete', 'Permite eliminar un estado de reserva')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'booking-statuses:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;