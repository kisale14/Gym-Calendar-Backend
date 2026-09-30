ALTER TABLE seguridad.users 
ADD COLUMN IF NOT EXISTS current_refresh_token VARCHAR(500) NULL;