// src/modules/iam/user-categories/user-categories.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UserCategoriesService } from './user_categories.service.js';
import { AssignCategoryToUserDto } from './dto/create-user_category.dto.js';
import { UserCategory } from './entities/user_category.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('user-categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserCategoriesController {
  constructor(private readonly userCategoriesService: UserCategoriesService) {}

  @Post()
  @RequirePermissions('user-categories:create')
  assign(@Body() dto: AssignCategoryToUserDto): Promise<UserCategory> {
    return this.userCategoriesService.assignCategory(dto);
  }

  @Get('user/:userId')
  @RequirePermissions('user-categories:read')
  findByUser(@Param('userId') userId: string): Promise<any[]> {
    return this.userCategoriesService.findCategoriesByUser(userId);
  }

  @Delete(':userId/:categoryId')
  @RequirePermissions('user-categories:delete')
  remove(
    @Param('userId') userId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<{ message: string }> {
    return this.userCategoriesService.removeCategoryFromUser(userId, categoryId);
  }
}