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
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { LessonsService, PaginatedResult } from './lessons.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { SearchLessonDto } from './dto/search-lesson.dto.js';
import { Lesson } from './entities/lesson.entity.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../iam/auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../../decorators/permissions.decorator.js';
import { FileUploadService } from './file-upload.service.js';
import {
  lessonFilesStorage,
  lessonFilesFilter,
} from './multer.config.js';

/** Límites de tamaño en bytes para la validación de Multer */
const MAX_IMAGE_BYTES = 5  * 1024 * 1024; // 5 MB
const MAX_PDF_BYTES   = 20 * 1024 * 1024; // 20 MB

@Controller('lessons')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * POST /lessons
   * Crea una nueva clase. Acepta multipart/form-data con campos opcionales:
   *   - image: archivo de imagen (JPEG, PNG, WEBP) — máx 5 MB
   *   - pdf:   archivo PDF                          — máx 20 MB
   */
  @Post()
  @RequirePermissions('lessons:create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'pdf',   maxCount: 1 },
      ],
      {
        storage:  lessonFilesStorage,
        fileFilter: lessonFilesFilter,
        limits: { fileSize: MAX_PDF_BYTES }, // límite más alto; imagen se valida en service
      },
    ),
  )
  create(
    @Body() createLessonDto: CreateLessonDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ): Promise<Lesson> {
    const userId    = req.user?.sub;
    const imageFile = files?.image?.[0];
    const pdfFile   = files?.pdf?.[0];

    // Validaciones de tamaño por tipo
    if (imageFile) this.fileUploadService.validateImage(imageFile);
    if (pdfFile)   this.fileUploadService.validatePdf(pdfFile);

    return this.lessonsService.create(createLessonDto, userId, imageFile, pdfFile);
  }

  /**
   * GET /lessons
   * Lista y busca clases con filtros por término (nombre/descripción),
   * categoría, instructor y paginación.
   */
  @Get()
  @RequirePermissions('lessons:read')
  findAll(
    @Query() searchDto: SearchLessonDto,
  ): Promise<PaginatedResult<Lesson>> {
    return this.lessonsService.findAll(searchDto);
  }

  /**
   * GET /lessons/:id
   * Retorna una clase específica con instructores y categorías.
   */
  @Get(':id')
  @RequirePermissions('lessons:read')
  findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  /**
   * PATCH /lessons/:id
   * Actualiza una clase. Acepta multipart/form-data con los mismos campos de archivos.
   * Si se sube un nuevo archivo, el anterior se elimina físicamente.
   */
  @Patch(':id')
  @RequirePermissions('lessons:update')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'pdf',   maxCount: 1 },
      ],
      {
        storage:    lessonFilesStorage,
        fileFilter: lessonFilesFilter,
        limits: { fileSize: MAX_PDF_BYTES },
      },
    ),
  )
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Req() req: any,
    @UploadedFiles()
    files?: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ): Promise<Lesson> {
    const userId    = req.user?.sub;
    const imageFile = files?.image?.[0];
    const pdfFile   = files?.pdf?.[0];

    // Validaciones de tamaño por tipo
    if (imageFile) this.fileUploadService.validateImage(imageFile);
    if (pdfFile)   this.fileUploadService.validatePdf(pdfFile);

    return this.lessonsService.update(id, updateLessonDto, userId, imageFile, pdfFile);
  }

  /**
   * DELETE /lessons/:id
   * Soft-delete de la clase y eliminación física de sus archivos adjuntos.
   */
  @Delete(':id')
  @RequirePermissions('lessons:delete')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.lessonsService.remove(id, userId);
  }
}
