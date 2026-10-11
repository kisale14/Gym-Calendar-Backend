// src/shared/genders/genders.controller.ts
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
import { GendersService } from './gender.service.js';
import { CreateGenderDto } from './dto/create-gender.dto.js';
import { UpdateGenderDto } from './dto/update-gender.dto.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';
import { Gender } from './entities/gender.entity.js';

@Controller('genders')
export class GendersController {
  constructor(private readonly gendersService: GendersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('genders:create')
  create(@Body() createGenderDto: CreateGenderDto): Promise<Gender> {
    return this.gendersService.create(createGenderDto);
  }

  @Get()
  findAll(): Promise<Gender[]> {
    return this.gendersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Gender> {
    return this.gendersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('genders:update')
  update(
    @Param('id') id: string,
    @Body() updateGenderDto: UpdateGenderDto,
  ): Promise<Gender> {
    return this.gendersService.update(id, updateGenderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('genders:delete')
  remove(@Param('id') id: string) {
    return this.gendersService.remove(id);
  }
}
