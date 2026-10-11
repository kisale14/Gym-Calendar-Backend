import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { MigrationsService } from './migrations.service.js';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrator = app.get(MigrationsService);

  try {
    await migrator.runMigrations();
    console.log('Migraciones finalizadas exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error crítico en migraciones:', error);
    process.exit(1);
  }
}

run();
