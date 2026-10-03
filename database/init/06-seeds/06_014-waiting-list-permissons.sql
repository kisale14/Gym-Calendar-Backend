-- Seed: Permisos para el módulo Waiting List
INSERT INTO seguridad.permissions (name, description) VALUES
    ('waiting_list:create', 'Permite registrar usuarios en la lista de espera'),
    ('waiting_list:read', 'Permite consultar y listar los registros de la lista de espera'),
    ('waiting_list:update', 'Permite actualizar el estado o posición en la lista de espera'),
    ('waiting_list:delete', 'Permite realizar un borrado lógico de un registro en la lista de espera')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'waiting_list:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;