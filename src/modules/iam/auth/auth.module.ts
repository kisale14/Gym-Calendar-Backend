// src/modules/iam/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { DatabaseService } from '../../../database/database.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js'; // <--- Tu guard manual

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: { 
          expiresIn: '15m' // Tiempo de vida del Access Token
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    DatabaseService, 
    JwtAuthGuard // <--- Registrado para que pueda inyectar JwtService y ConfigService
  ],
  exports: [
    JwtAuthGuard, // <--- Exportado por si otros módulos necesitan usarlo
    JwtModule
  ],
})
export class AuthModule {}