import { PartialType } from '@nestjs/mapped-types';
import { AssignCategoryToUserDto } from './create-user_category.dto.js';

export class UpdateUserCategoryDto extends PartialType(AssignCategoryToUserDto) {}
