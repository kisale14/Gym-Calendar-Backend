import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LessonsInstructorsService } from './lessons-instructors.service.js';
import { CreateLessonsInstructorDto } from './dto/create-lessons-instructor.dto.js';
import { LessonsInstructor } from './entities/lessons-instructor.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('lessons-instructors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LessonsInstructorsController {
  constructor(
    private readonly lessonsInstructorsService: LessonsInstructorsService,
  ) {}

  @Post()
  @RequirePermissions('lessons_instructors:create')
  assign(
    @Body() createDto: CreateLessonsInstructorDto,
  ): Promise<LessonsInstructor> {
    return this.lessonsInstructorsService.assignInstructor(createDto);
  }

  @Get()
  @RequirePermissions('lessons_instructors:read')
  findAll(): Promise<LessonsInstructor[]> {
    return this.lessonsInstructorsService.findAll();
  }

  @Get('lesson/:lessonId')
  @RequirePermissions('lessons_instructors:read')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.lessonsInstructorsService.findByLesson(lessonId);
  }

  @Delete(':lessonId/:instructorId')
  @RequirePermissions('lessons_instructors:delete')
  remove(
    @Param('lessonId') lessonId: string,
    @Param('instructorId') instructorId: string,
  ) {
    return this.lessonsInstructorsService.remove(lessonId, instructorId);
  }
}
