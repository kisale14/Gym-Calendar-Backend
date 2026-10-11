-- Migración: Optimización de búsqueda de clases mediante índices de texto trigram
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_lessons_name_trgm
    ON scheduling.lessons USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_lessons_description_trgm
    ON scheduling.lessons USING gin (description gin_trgm_ops);
