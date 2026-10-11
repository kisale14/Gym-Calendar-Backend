import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
import { Express } from 'express';

/** Tipos de archivo aceptados por categoría */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

/** Tamaños máximos en bytes */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_PDF_SIZE   = 20 * 1024 * 1024; // 20 MB

@Injectable()
export class FileUploadService {
  /**
   * Directorio raíz donde se almacenan físicamente los archivos.
   * Queda en: <project-root>/uploads/lessons/
   */
  private readonly baseUploadsDir = join(process.cwd(), 'uploads', 'lessons');

  constructor() {
    // Garantizar que los subdirectorios existen al levantar el servicio
    this.ensureDir(join(this.baseUploadsDir, 'images'));
    this.ensureDir(join(this.baseUploadsDir, 'pdfs'));
  }

  // ─── Validaciones ────────────────────────────────────────────────────────────

  validateImage(file: Express.Multer.File): void {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de imagen no permitido: ${file.mimetype}. Solo se aceptan JPEG, PNG o WEBP.`,
      );
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `La imagen supera el tamaño máximo permitido de ${MAX_IMAGE_SIZE / 1024 / 1024} MB.`,
      );
    }
  }

  validatePdf(file: Express.Multer.File): void {
    if (!ALLOWED_PDF_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan archivos PDF.`,
      );
    }
    if (file.size > MAX_PDF_SIZE) {
      throw new BadRequestException(
        `El PDF supera el tamaño máximo permitido de ${MAX_PDF_SIZE / 1024 / 1024} MB.`,
      );
    }
  }

  // ─── Rutas públicas (relativas, devueltas al cliente) ────────────────────────

  /**
   * Retorna la ruta relativa pública que se guardará en la BD y que el cliente
   * usará para acceder al archivo a través del endpoint de archivos estáticos.
   * Ejemplo: "uploads/lessons/images/1728321722345-abc123.png"
   */
  getRelativePath(subDir: 'images' | 'pdfs', filename: string): string {
    return `uploads/lessons/${subDir}/${filename}`;
  }

  // ─── Eliminación de archivos previos ────────────────────────────────────────

  /**
   * Elimina físicamente un archivo dado su ruta relativa guardada en la BD.
   * No lanza error si el archivo no existe (tolerancia a inconsistencias).
   */
  deleteFile(relativePath: string | null | undefined): void {
    if (!relativePath) return;
    const absolutePath = join(process.cwd(), relativePath);
    try {
      if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      }
    } catch {
      // Se registra pero no se interrumpe el flujo
      console.warn(`[FileUploadService] No se pudo eliminar: ${absolutePath}`);
    }
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private ensureDir(dirPath: string): void {
    if (!existsSync(dirPath)) {
      try {
        mkdirSync(dirPath, { recursive: true });
      } catch (err) {
        throw new InternalServerErrorException(
          `No se pudo crear el directorio de uploads: ${dirPath}`,
        );
      }
    }
  }
}
