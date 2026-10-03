-- Seed: Permisos para el módulo Lessons dentro del esquema de seguridad
INSERT INTO seguridad.permissions (name, description) VALUES
    ('lessons:create', 'Permite crear nuevas clases'),
    ('lessons:read', 'Permite listar y consultar las clases'),
    ('lessons:update', 'Permite actualizar la información de las clases'),
    ('lessons:delete', 'Permite realizar un borrado lógico de una clase')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol Admin
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'lessons:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;