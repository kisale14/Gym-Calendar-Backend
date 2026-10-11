export class PermissionItem {
  id: string;
  name: string;
  description: string;
}

export class Role {
  id: string;
  name: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
  permissions_by_resource?: Record<string, PermissionItem[]>;
}
