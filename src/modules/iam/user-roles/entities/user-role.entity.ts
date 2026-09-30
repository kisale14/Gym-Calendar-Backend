export class PermissionInRoleEntity {
  id: string;
  name: string;
  description: string;
}

export class RoleWithPermissionsEntity {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  permissions: PermissionInRoleEntity[]; // <--- Lista de permisos del rol
}