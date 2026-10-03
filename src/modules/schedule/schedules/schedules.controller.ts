import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { Schedule } from './entities/schedule.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('schedules')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @RequirePermissions('schedules:create')
  create(@Body() createScheduleDto: CreateScheduleDto, @Req() req: any): Promise<Schedule> {
    const userId = req.user?.sub;
    return this.schedulesService.create(createScheduleDto, userId);
  }

  @Get()
  @RequirePermissions('schedules:read')
  findAll(): Promise<Schedule[]> {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('schedules:read')
  findOne(@Param('id') id: string): Promise<Schedule> {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('schedules:update')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: any,
  ): Promise<Schedule> {
    const userId = req.user?.sub;
    return this.schedulesService.update(id, updateScheduleDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('schedules:delete')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.schedulesService.remove(id, userId);
  }
}