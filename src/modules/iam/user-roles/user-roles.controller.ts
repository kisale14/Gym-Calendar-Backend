import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';
import { CreateUserRoleDto } from './dto/create-user-role.dto.js';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  assign(@Body() dto: CreateUserRoleDto) {
    return this.userRolesService.assignRole(dto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.userRolesService.findRolesByUser(userId);
  }

  @Delete('user/:userId/role/:roleId')
  remove(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.userRolesService.removeRole(userId, roleId);
  }
}