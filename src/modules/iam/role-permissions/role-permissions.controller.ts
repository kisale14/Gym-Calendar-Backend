import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service.js';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto.js';

@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  assign(@Body() dto: CreateRolePermissionDto) {
    return this.rolePermissionsService.assignPermission(dto);
  }

  @Get('role/:roleId')
  findByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionsService.findPermissionsByRole(roleId);
  }

  @Delete('role/:roleId/permission/:permissionId')
  remove(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolePermissionsService.removePermission(roleId, permissionId);
  }
}