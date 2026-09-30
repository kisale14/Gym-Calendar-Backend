-- =====================================================================
-- Seed: Permisos para el CRUD del módulo Genders
-- Esquema: seguridad
-- =====================================================================

-- 1. Insertar los permisos estándar de Genders (evitando duplicados con ON CONFLICT)
INSERT INTO seguridad.permissions (name, description) VALUES
    ('genders:create', 'Permite crear nuevos géneros'),
    ('genders:read', 'Permite listar y consultar los géneros'),
    ('genders:update', 'Permite actualizar la información de los géneros'),
    ('genders:delete', 'Permite eliminar lógicamente un género')
ON CONFLICT (name) DO NOTHING;

-- 2. Asignar automáticamente estos permisos al rol de Administrador ('Admin')
-- (Asegura que el rol Admin herede de inmediato el control total del módulo)
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'genders:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;