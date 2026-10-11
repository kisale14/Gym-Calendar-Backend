import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.constants.js';

@Injectable()
export class HealthService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async testConecction(): Promise<String> {
    try {
      const result = await this.pool.query('SELECT NOW()');
      const serverTime = result.rows[0].now;

      return `¡Conexión exitosa a PostgreSQL! Hora del servidor: ${serverTime}`;
    } catch (error) {
      return `Error al conectar a la base de datos: ${error}`;
    }
  }
}
