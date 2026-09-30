// src/shared/statuses/statuses.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StatusesService } from './statuses.service.js';
import { CreateStatusDto } from './dto/create-status.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { Status } from './entities/status.entity.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';

@Controller('statuses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Post()
  @RequirePermissions('statuses:create')
  create(@Body() createStatusDto: CreateStatusDto): Promise<Status> {
    return this.statusesService.create(createStatusDto);
  }

  @Get()
  @RequirePermissions('statuses:read')
  findAll(): Promise<Status[]> {
    return this.statusesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('statuses:read')
  findOne(@Param('id') id: string): Promise<Status> {
    return this.statusesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('statuses:update')
  update(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto): Promise<Status> {
    return this.statusesService.update(id, updateStatusDto);
  }

  @Delete(':id')
  @RequirePermissions('statuses:delete')
  remove(@Param('id') id: string) {
    return this.statusesService.remove(id);
  }
}