import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { RolePermissionsModule } from './role-permissions/role-permissions.module.js';
import { UserRolesModule } from './user-roles/user-roles.module.js';
import { UserCategoriesModule } from './user_categories/user_categories.module.js';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserRolesModule,
    UserCategoriesModule,
  ],
  exports: [AuthModule, UsersModule],
})
export class IamModule {}