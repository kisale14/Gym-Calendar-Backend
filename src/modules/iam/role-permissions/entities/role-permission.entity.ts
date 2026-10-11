export class RolePermission {
  role_id: string;
  permission_id: string;
  created_at: Date;
}

// Interfaz enriquecida opcional para cuando hagas JOIN y traigas los datos del permiso completo
export class PermissionDetailEntity {
  id: string;
  name: string;
  description: string;
  created_at: Date;
}
