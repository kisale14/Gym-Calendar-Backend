// src/shared/attendance-statuses/attendance-statuses.controller.ts
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
import { AttendanceStatusesService } from './attendance-statuses.service.js';
import { CreateAttendanceStatusDto } from './dto/create-attendance-status.dto.js';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto.js';
import { AttendanceStatus } from './entities/attendance-status.entity.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';

@Controller('attendance-statuses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceStatusesController {
  constructor(
    private readonly attendanceStatusesService: AttendanceStatusesService,
  ) {}

  @Post()
  @RequirePermissions('attendance-statuses:create')
  create(
    @Body() createAttendanceStatusDto: CreateAttendanceStatusDto,
  ): Promise<AttendanceStatus> {
    return this.attendanceStatusesService.create(createAttendanceStatusDto);
  }

  @Get()
  @RequirePermissions('attendance-statuses:read')
  findAll(): Promise<AttendanceStatus[]> {
    return this.attendanceStatusesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('attendance-statuses:read')
  findOne(@Param('id') id: string): Promise<AttendanceStatus> {
    return this.attendanceStatusesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('attendance-statuses:update')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceStatusDto: UpdateAttendanceStatusDto,
  ): Promise<AttendanceStatus> {
    return this.attendanceStatusesService.update(id, updateAttendanceStatusDto);
  }

  @Delete(':id')
  @RequirePermissions('attendance-statuses:delete')
  remove(@Param('id') id: string) {
    return this.attendanceStatusesService.remove(id);
  }
}
