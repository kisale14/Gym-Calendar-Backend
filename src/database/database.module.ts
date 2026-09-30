import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { MigrationsService } from './migrations.service.js';
import { DATABASE_POOL } from './database.constants.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Obtenemos los valores usando el namespace 'database'
        const host = configService.get<string>('database.host');
        const port = configService.get<number>('database.port');
        const user = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.name');

        console.log(`🔌 Conectando a la base de datos: [ ${database} ]`);

        return new Pool({
          host,
          port,
          user,
          password,
          database,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
      },
    },
    MigrationsService,
  ],
  exports: [DATABASE_POOL, MigrationsService],
})
export class DatabaseModule {}