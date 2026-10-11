export class Permission {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export class GroupedPermissions {
  [resourceTitle: string]: Permission[];
}
