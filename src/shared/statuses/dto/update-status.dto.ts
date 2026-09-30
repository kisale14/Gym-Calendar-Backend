import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusDto } from './create-status.dto.js';

export class UpdateStatusDto extends PartialType(CreateStatusDto) {}
