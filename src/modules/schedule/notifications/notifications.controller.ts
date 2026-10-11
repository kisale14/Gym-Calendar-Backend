// src/modules/schedule/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { UpdateNotificationDto } from './dto/update-notification.dto.js';
import { Notification } from './entities/notification.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @RequirePermissions('notifications:create')
  create(@Body() createDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(createDto);
  }

  @Get()
  @RequirePermissions('notifications:read')
  findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('notifications:read')
  findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('notifications:update')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationsService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('notifications:delete')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
