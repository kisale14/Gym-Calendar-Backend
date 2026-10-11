// src/modules/schedule/bookings/bookings.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Booking } from './entities/booking.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @RequirePermissions('bookings:create')
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: any,
  ): Promise<Booking> {
    const userId = req.user?.sub;
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Get()
  @RequirePermissions('bookings:read')
  findAll(): Promise<Booking[]> {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('bookings:read')
  findOne(@Param('id') id: string): Promise<Booking> {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('bookings:update')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: any,
  ): Promise<Booking> {
    const userId = req.user?.sub;
    return this.bookingsService.update(id, updateBookingDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('bookings:delete')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.bookingsService.remove(id, userId);
  }
}
