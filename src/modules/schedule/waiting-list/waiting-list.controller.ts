import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service.js';
import { CreateWaitingListDto } from './dto/create-waiting-list.dto.js';
import { UpdateWaitingListDto } from './dto/update-waiting-list.dto.js';
import { WaitingList } from './entities/waiting-list.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';

@Controller('waiting-list')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Post()
  @RequirePermissions('waiting_list:create')
  create(@Body() createDto: CreateWaitingListDto, @Req() req: any): Promise<WaitingList> {
    const userId = req.user?.sub;
    return this.waitingListService.create(createDto, userId);
  }

  @Get()
  @RequirePermissions('waiting_list:read')
  findAll(): Promise<WaitingList[]> {
    return this.waitingListService.findAll();
  }

  @Get(':id')
  @RequirePermissions('waiting_list:read')
  findOne(@Param('id') id: string): Promise<WaitingList> {
    return this.waitingListService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('waiting_list:update')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWaitingListDto,
    @Req() req: any,
  ): Promise<WaitingList> {
    const userId = req.user?.sub;
    return this.waitingListService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('waiting_list:delete')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.waitingListService.remove(id, userId);
  }
}