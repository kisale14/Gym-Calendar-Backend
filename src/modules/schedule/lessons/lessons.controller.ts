import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { LessonsService, PaginatedResult } from './lessons.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { Lesson } from './entities/lesson.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('lessons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @RequirePermissions('lessons:create')
  create(@Body() createLessonDto: CreateLessonDto, @Req() req: any): Promise<Lesson> {
    const userId = req.user?.sub; // ID del usuario autenticado vía JWT
    return this.lessonsService.create(createLessonDto, userId);
  }

  @Get()
  @RequirePermissions('lessons:read')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<Lesson>> {
    return this.lessonsService.findAll(page, limit);
  }

  @Get(':id')
  @RequirePermissions('lessons:read')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('lessons:update')
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req: any,
  ): Promise<Lesson> {
    const userId = req.user?.sub;
    return this.lessonsService.update(id, updateLessonDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('lessons:delete')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.lessonsService.remove(id, userId);
  }
}