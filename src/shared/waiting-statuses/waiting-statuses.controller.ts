// src/shared/waiting-statuses/waiting-statuses.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WaitingStatusesService } from './waiting-statuses.service.js';
import { CreateWaitingStatusDto } from './dto/create-waiting-status.dto.js';
import { UpdateWaitingStatusDto } from './dto/update-waiting-status.dto.js';
import { WaitingStatus } from './entities/waiting-status.entity.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';

@Controller('waiting-statuses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WaitingStatusesController {
  constructor(private readonly waitingStatusesService: WaitingStatusesService) {}

  @Post()
  @RequirePermissions('waiting-statuses:create')
  create(@Body() createWaitingStatusDto: CreateWaitingStatusDto): Promise<WaitingStatus> {
    return this.waitingStatusesService.create(createWaitingStatusDto);
  }

  @Get()
  @RequirePermissions('waiting-statuses:read')
  findAll(): Promise<WaitingStatus[]> {
    return this.waitingStatusesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('waiting-statuses:read')
  findOne(@Param('id') id: string): Promise<WaitingStatus> {
    return this.waitingStatusesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('waiting-statuses:update')
  update(@Param('id') id: string, @Body() updateWaitingStatusDto: UpdateWaitingStatusDto): Promise<WaitingStatus> {
    return this.waitingStatusesService.update(id, updateWaitingStatusDto);
  }

  @Delete(':id')
  @RequirePermissions('waiting-statuses:delete')
  remove(@Param('id') id: string) {
    return this.waitingStatusesService.remove(id);
  }
}