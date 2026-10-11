import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { Express } from 'express';

/** Tipos de archivo aceptados */
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF_MIME   = ['application/pdf'];

/** Genera un nombre de archivo único basado en timestamp + random */
function generateFilename(file: Express.Multer.File): string {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext    = extname(file.originalname).toLowerCase();
  return `${unique}${ext}`;
}

/** Asegura que el directorio destino exista */
function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ─── Storage para imágenes ────────────────────────────────────────────────────

export const imageStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dest = join(process.cwd(), 'uploads', 'lessons', 'images');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    cb(null, generateFilename(file));
  },
});

export const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: any,
) => {
  if (!ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Tipo de imagen no permitido: ${file.mimetype}. Solo JPEG, PNG o WEBP.`,
      ),
      false,
    );
  }
  cb(null, true);
};

// ─── Storage para PDFs ────────────────────────────────────────────────────────

export const pdfStorage = diskStorage({
  destination: (_req, _file, cb) => {
    const dest = join(process.cwd(), 'uploads', 'lessons', 'pdfs');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    cb(null, generateFilename(file));
  },
});

export const pdfFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: any,
) => {
  if (!ALLOWED_PDF_MIME.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. Solo PDF.`,
      ),
      false,
    );
  }
  cb(null, true);
};

// ─── Storage combinado (imagen + pdf en un mismo endpoint) ───────────────────

export const lessonFilesStorage = diskStorage({
  destination: (_req, file, cb) => {
    const subDir =
      ALLOWED_IMAGE_MIME.includes(file.mimetype) ? 'images' : 'pdfs';
    const dest = join(process.cwd(), 'uploads', 'lessons', subDir);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    cb(null, generateFilename(file));
  },
});

export const lessonFilesFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: any,
) => {
  const allowed = [...ALLOWED_IMAGE_MIME, ...ALLOWED_PDF_MIME];
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}.`,
      ),
      false,
    );
  }
  cb(null, true);
};
