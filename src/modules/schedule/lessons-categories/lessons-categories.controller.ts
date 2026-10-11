import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LessonsCategoriesService } from './lessons-categories.service.js';
import { CreateLessonsCategoryDto } from './dto/create-lessons-category.dto.js';
import { LessonsCategory } from './entities/lessons-category.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('lessons-categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LessonsCategoriesController {
  constructor(
    private readonly lessonsCategoriesService: LessonsCategoriesService,
  ) {}

  @Post()
  @RequirePermissions('lessons_categories:create')
  assign(
    @Body() createDto: CreateLessonsCategoryDto,
  ): Promise<LessonsCategory> {
    return this.lessonsCategoriesService.assignCategory(createDto);
  }

  @Get()
  @RequirePermissions('lessons_categories:read')
  findAll(): Promise<LessonsCategory[]> {
    return this.lessonsCategoriesService.findAll();
  }

  @Get('lesson/:lessonId')
  @RequirePermissions('lessons_categories:read')
  findCategoriesByLesson(@Param('lessonId') lessonId: string) {
    return this.lessonsCategoriesService.findCategoriesByLesson(lessonId);
  }

  @Delete(':lessonId/:categoryId')
  @RequirePermissions('lessons_categories:delete')
  remove(
    @Param('lessonId') lessonId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.lessonsCategoriesService.remove(lessonId, categoryId);
  }
}
