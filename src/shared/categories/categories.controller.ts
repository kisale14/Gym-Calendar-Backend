// src/shared/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';

@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Protege todo el controlador asegurando autenticación y control de permisos
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions('categories:create')
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @RequirePermissions('categories:read')
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('categories:read')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('categories:update')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @RequirePermissions('categories:delete')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}