import { PartialType } from '@nestjs/mapped-types';
import { CreateWaitingStatusDto } from './create-waiting-status.dto.js';

export class UpdateWaitingStatusDto extends PartialType(CreateWaitingStatusDto) {}
