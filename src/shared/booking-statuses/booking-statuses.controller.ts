// src/shared/booking-statuses/booking-statuses.controller.ts
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
import { BookingStatusesService } from './booking-statuses.service.js';
import { CreateBookingStatusDto } from './dto/create-booking-status.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { BookingStatus } from './entities/booking-status.entity.js';
import { JwtAuthGuard } from '../../modules/iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../modules/iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../decorators/permissions.decorator.js';

@Controller('booking-statuses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BookingStatusesController {
  constructor(
    private readonly bookingStatusesService: BookingStatusesService,
  ) {}

  @Post()
  @RequirePermissions('booking-statuses:create')
  create(
    @Body() createBookingStatusDto: CreateBookingStatusDto,
  ): Promise<BookingStatus> {
    return this.bookingStatusesService.create(createBookingStatusDto);
  }

  @Get()
  @RequirePermissions('booking-statuses:read')
  findAll(): Promise<BookingStatus[]> {
    return this.bookingStatusesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('booking-statuses:read')
  findOne(@Param('id') id: string): Promise<BookingStatus> {
    return this.bookingStatusesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('booking-statuses:update')
  update(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ): Promise<BookingStatus> {
    return this.bookingStatusesService.update(id, updateBookingStatusDto);
  }

  @Delete(':id')
  @RequirePermissions('booking-statuses:delete')
  remove(@Param('id') id: string) {
    return this.bookingStatusesService.remove(id);
  }
}
