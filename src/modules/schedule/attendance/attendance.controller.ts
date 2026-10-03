import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { CreateAttendanceDto } from './dto/create-attendance.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';
import { Attendance } from './entities/attendance.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @RequirePermissions('attendance:create')
  create(@Body() createAttendanceDto: CreateAttendanceDto, @Req() req: any): Promise<Attendance> {
    const userId = req.user?.sub;
    return this.attendanceService.create(createAttendanceDto, userId);
  }

  @Get()
  @RequirePermissions('attendance:read')
  findAll(): Promise<Attendance[]> {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @RequirePermissions('attendance:read')
  findOne(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('attendance:update')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Req() req: any,
  ): Promise<Attendance> {
    const userId = req.user?.sub;
    return this.attendanceService.update(id, updateAttendanceDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('attendance:delete')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.attendanceService.remove(id, userId);
  }
}