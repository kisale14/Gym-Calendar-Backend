import { PartialType } from '@nestjs/mapped-types';
import { CreateWaitingListDto } from './create-waiting-list.dto.js';

export class UpdateWaitingListDto extends PartialType(CreateWaitingListDto) {}
