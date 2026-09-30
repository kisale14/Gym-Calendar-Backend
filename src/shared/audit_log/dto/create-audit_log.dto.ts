import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID, IsInt, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  table_name: string;

  @IsUUID()
  @IsNotEmpty()
  record_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  action: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsUUID()
  @IsOptional()
  changed_by?: string;

  @IsObject()
  @IsOptional()
  old_values?: Record<string, any>;

  @IsObject()
  @IsOptional()
  new_values?: Record<string, any>;

  @IsInt()
  @IsOptional()
  version?: number;
}