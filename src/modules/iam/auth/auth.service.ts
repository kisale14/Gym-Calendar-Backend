import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../../database/database.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { username, password } = dto;

    // 1. Consulta incluyendo el rol del usuario mediante JOIN
    const query = `
      SELECT 
        u.*, 
        g.name AS gender_name,
        r.name AS role_name
      FROM seguridad.users u
      INNER JOIN shared.genders g ON u.gender_id = g.id
      LEFT JOIN seguridad.user_roles ur ON u.id = ur.user_id
      LEFT JOIN seguridad.roles r ON ur.role_id = r.id
      WHERE (u.email = $1 OR u.username = $1) AND u.is_deleted = false;
    `;
    const result = await this.db.query(query, [username]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const user = result.rows[0];

    // 2. Validar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // 3. Payload limpio y ligero (incluyendo el rol si lo necesitas en el token)
    const payload = { sub: user.id, email: user.email, username: user.username, role: user.role_name };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 4. Guardar el refresh token en la BD
    const updateQuery = `
      UPDATE seguridad.users 
      SET current_refresh_token = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2;
    `;
    await this.db.query(updateQuery, [refreshToken, user.id]);

    // 5. Retornar únicamente los tokens y los datos de usuario solicitados
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        first_name: user.name, // O el nombre exacto de tu columna para el nombre
        last_name: user.lastname,   // O el nombre exacto de tu columna para el apellido
        role: user.role_name || null,
      },
    };
  }

  async refreshTokens(incomingRefreshToken: string) {
    let payload: any;
    try {
      // Verificar validez criptográfica del refresh token
      payload = this.jwtService.verify(incomingRefreshToken);
    } catch (e) {
      throw new UnauthorizedException('Refresh token expirado o inválido.');
    }

    const userId = payload.sub;

    // Buscar al usuario en la BD
    const query = `
      SELECT id, email, username, current_refresh_token, is_deleted
      FROM seguridad.users 
      WHERE id = $1 AND is_deleted = false;
    `;
    const result = await this.db.query(query, [userId]);

    if (result.rows.length === 0 || result.rows[0].current_refresh_token !== incomingRefreshToken) {
      throw new UnauthorizedException('Acceso denegado. Sesión no válida.');
    }

    const user = result.rows[0];

    // Generar nuevo par de tokens con payload limpio
    const newPayload = { sub: user.id, email: user.email, username: user.username };
    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

    // Actualizar el nuevo refresh token en la BD
    const updateQuery = `
      UPDATE seguridad.users 
      SET current_refresh_token = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2;
    `;
    await this.db.query(updateQuery, [newRefreshToken, user.id]);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async getProfile(userId: string) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.lastname,
        u.username,
        u.email,
        COALESCE(ARRAY_AGG(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles,
        COALESCE(ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') AS permissions
      FROM seguridad.users u
      LEFT JOIN seguridad.user_roles ur ON u.id = ur.user_id
      LEFT JOIN seguridad.roles r ON ur.role_id = r.id
      LEFT JOIN seguridad.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN seguridad.permissions p ON rp.permission_id = p.id -- (O seguridad.permissions según tu esquema)
      WHERE u.id = $1 AND u.is_deleted = false
      GROUP BY u.id, u.name, u.lastname, u.username, u.email;
    `;

    const result = await this.db.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo.');
    }

    const row = result.rows[0];

    return {
      name: `${row.name} ${row.lastname}`,
      username: row.username,
      email: row.email,
      roles: row.roles,         
      permissions: row.permissions, 
    };
  }

  async logout(userId: string) {
    const query = `
      UPDATE seguridad.users 
      SET current_refresh_token = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1;
    `;
    await this.db.query(query, [userId]);
    return { message: 'Sesión cerrada exitosamente.' };
  }
}