-- Migración: Agregar columnas de archivos a la tabla scheduling.lessons
-- PDF referencial e imagen de portada de la clase

ALTER TABLE scheduling.lessons
  ADD COLUMN IF NOT EXISTS pdf_url    VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS image_url  VARCHAR(500) NULL;

COMMENT ON COLUMN scheduling.lessons.pdf_url   IS 'Ruta relativa al PDF adjunto de la clase (almacenado físicamente en uploads/lessons/pdfs/)';
COMMENT ON COLUMN scheduling.lessons.image_url IS 'Ruta relativa a la imagen referencial de la clase (almacenado físicamente en uploads/lessons/images/)';
