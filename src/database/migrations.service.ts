import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationsService {
  private readonly logger = new Logger(MigrationsService.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async runMigrations() {
    const client = await this.pool.connect();
    try {
      // 1. Asegurar que existe la tabla de control de migraciones
      await client.query(`
        CREATE TABLE IF NOT EXISTS executed_migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Obtener las migraciones ya ejecutadas
      const { rows } = await client.query('SELECT name FROM executed_migrations');
      const executedSet = new Set(rows.map((r) => r.name));

      // 3. Leer la ruta de la carpeta init (ajusta según la ubicación de tu proyecto)
      // Asumiendo que 'database/init' está en la raíz del proyecto
      const initBasePath = path.join(process.cwd(), 'database', 'init');
      
      if (!fs.existsSync(initBasePath)) {
        this.logger.warn(`No se encontró la ruta de migraciones en: ${initBasePath}`);
        return;
      }

      // Leer carpetas ordenadas alfabéticamente (ej: 01-basic, 02-shared...)
      const categories = fs.readdirSync(initBasePath).sort();

      for (const category of categories) {
        const categoryPath = path.join(initBasePath, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;

        // Leer archivos .sql dentro de cada categoría ordenados alfabéticamente
        const files = fs.readdirSync(categoryPath)
          .filter((file) => file.endsWith('.sql'))
          .sort();

        for (const file of files) {
          const migrationName = `${category}/${file}`;

          if (executedSet.has(migrationName)) {
            continue; // Ya fue ejecutada, la saltamos
          }

          const filePath = path.join(categoryPath, file);
          const sqlContent = fs.readFileSync(filePath, 'utf8');

          this.logger.log(`Ejecutando migración: ${migrationName}...`);

          // 4. Ejecutar la migración dentro de una transacción
          try {
            await client.query('BEGIN');
            
            // Ejecutar el script SQL del archivo
            await client.query(sqlContent);

            // Registrar como ejecutada
            await client.query(
              'INSERT INTO executed_migrations (name) VALUES ($1)',
              [migrationName],
            );

            await client.query('COMMIT');
            this.logger.log(`Migración completada con éxito: ${migrationName}`);
          } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error(`Error ejecutando ${migrationName}: ${error}`);
            throw error; // Detiene el proceso si una migración falla
          }
        }
      }

      this.logger.log('¡Todas las migraciones se han aplicado correctamente!');
    } catch (error) {
      this.logger.error('Fallo en el proceso de migraciones.');
      throw error;
    } finally {
      client.release();
    }
  }
}