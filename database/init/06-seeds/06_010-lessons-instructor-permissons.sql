-- Seed: Permisos para el módulo Lessons Instructors
INSERT INTO seguridad.permissions (name, description) VALUES
    ('lessons_instructors:create', 'Permite asignar un instructor a una clase'),
    ('lessons_instructors:read', 'Permite consultar las asignaciones de instructores y clases'),
    ('lessons_instructors:delete', 'Permite remover la asignación de un instructor de una clase')
ON CONFLICT (name) DO NOTHING;

-- Asignar automáticamente los permisos al rol ADMINISTRATOR
INSERT INTO seguridad.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permissions p
WHERE r.name = 'ADMINISTRATOR' 
  AND p.name LIKE 'lessons_instructors:%'
ON CONFLICT (role_id, permission_id) DO NOTHING;