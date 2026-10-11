import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../../database/database.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

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
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role_name,
    };

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
        last_name: user.lastname, // O el nombre exacto de tu columna para el apellido
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

    if (
      result.rows.length === 0 ||
      result.rows[0].current_refresh_token !== incomingRefreshToken
    ) {
      throw new UnauthorizedException('Acceso denegado. Sesión no válida.');
    }

    const user = result.rows[0];

    // Generar nuevo par de tokens con payload limpio
    const newPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

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
    const userQuery = `
      SELECT 
        u.id,
        u.name,
        u.lastname,
        u.date_birth,
        u.email,
        u.username,
        u.image,
        u.phone,
        u.created_at,
        u.updated_at,
        g.id AS gender_id,
        g.name AS gender_name,
        COALESCE(ARRAY_AGG(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles,
        COALESCE(ARRAY_AGG(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') AS permissions
      FROM seguridad.users u
      LEFT JOIN shared.genders g ON u.gender_id = g.id
      LEFT JOIN seguridad.user_roles ur ON u.id = ur.user_id
      LEFT JOIN seguridad.roles r ON ur.role_id = r.id
      LEFT JOIN seguridad.role_permissions rp ON r.id = rp.role_id
      LEFT JOIN seguridad.permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND u.is_deleted = false
      GROUP BY u.id, u.name, u.lastname, u.date_birth, u.email, u.username, u.image, u.phone, u.created_at, u.updated_at, g.id, g.name;
    `;

    const result = await this.db.query(userQuery, [userId]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo.');
    }

    const u = result.rows[0];
    const roles: string[] = u.roles || [];
    const primaryRole = roles[0] || 'CLIENT';

    // Obtener categorías asignadas y estadísticas de valor
    let categories: any[] = [];
    let activeBookings = 0;
    let unreadNotifications = 0;

    try {
      const categoriesRes = await this.db.query(
        `SELECT c.id, c.name, c.description 
         FROM shared.categories c 
         INNER JOIN seguridad.user_categories uc ON c.id = uc.category_id 
         WHERE uc.user_id = $1;`,
        [userId],
      );
      categories = categoriesRes.rows;
    } catch {
      // Ignorar si la tabla auxiliar aún no está disponible
    }

    try {
      const bookingsRes = await this.db.query(
        `SELECT COUNT(*) AS total 
         FROM scheduling.bookings 
         WHERE user_id = $1 AND is_deleted = false AND cancelled_at IS NULL;`,
        [userId],
      );
      activeBookings = parseInt(bookingsRes.rows[0]?.total || '0', 10);
    } catch {
      // Fallback silencioso
    }

    try {
      const notificationsRes = await this.db.query(
        `SELECT COUNT(*) AS total 
         FROM scheduling.notifications 
         WHERE user_id = $1 AND is_deleted = false AND read_at IS NULL;`,
        [userId],
      );
      unreadNotifications = parseInt(notificationsRes.rows[0]?.total || '0', 10);
    } catch {
      // Fallback silencioso
    }

    return {
      id: u.id,
      name: u.name,
      lastname: u.lastname,
      full_name: `${u.name} ${u.lastname}`.trim(),
      username: u.username,
      email: u.email,
      phone: u.phone,
      date_birth: u.date_birth,
      image: u.image,
      created_at: u.created_at,
      gender: u.gender_id
        ? {
            id: u.gender_id,
            name: u.gender_name,
          }
        : null,
      roles,
      primary_role: primaryRole,
      permissions: u.permissions || [],
      categories,
      stats: {
        active_bookings: activeBookings,
        unread_notifications: unreadNotifications,
      },
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

  /**
   * Verifica si un email ya está registrado en el sistema.
   * Endpoint público — no requiere autenticación.
   */
  async checkEmailExists(email: string): Promise<{ email: string; registered: boolean }> {
    const query = `
      SELECT COUNT(*) AS total
      FROM seguridad.users
      WHERE LOWER(email) = LOWER($1) AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [email]);
    const registered = parseInt(result.rows[0].total, 10) > 0;

    return { email, registered };
  }

  /**
   * Verifica si un username está disponible para ser usado.
   * Endpoint público — no requiere autenticación.
   */
  async checkUsernameAvailable(username: string): Promise<{ username: string; available: boolean }> {
    const query = `
      SELECT COUNT(*) AS total
      FROM seguridad.users
      WHERE LOWER(username) = LOWER($1) AND is_deleted = FALSE;
    `;
    const result = await this.db.query(query, [username]);
    const available = parseInt(result.rows[0].total, 10) === 0;

    return { username, available };
  }

  /**
   * Registra un cliente de forma pública y le asigna atómicamente el rol "CLIENT".
   */
  async register(dto: RegisterDto) {
    const plainPassword = dto.password || dto.password_hash;
    if (!plainPassword) {
      throw new BadRequestException('La contraseña es obligatoria.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    return this.db.transaction(async (client) => {
      // 1. Obtener o asegurar la existencia del rol 'CLIENT'
      let roleId: string;
      const roleResult = await client.query(
        `SELECT id FROM seguridad.roles WHERE UPPER(name) = 'CLIENT' LIMIT 1;`,
      );

      if (roleResult.rows.length > 0) {
        roleId = roleResult.rows[0].id;
      } else {
        const createRoleResult = await client.query(
          `INSERT INTO seguridad.roles (name, description) 
           VALUES ('CLIENT', 'Rol asignado a clientes del gimnasio') 
           RETURNING id;`,
        );
        roleId = createRoleResult.rows[0].id;
      }

      // 2. Insertar el nuevo usuario en seguridad.users
      let user: any;
      try {
        const insertUserQuery = `
          INSERT INTO seguridad.users (
            name, lastname, date_birth, email, username, password_hash, image, phone, gender_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, name, lastname, date_birth, email, username, image, phone, gender_id, created_at, updated_at;
        `;
        const values = [
          dto.name,
          dto.lastname,
          dto.date_birth,
          dto.email,
          dto.username,
          hashedPassword,
          dto.image ?? null,
          dto.phone ?? null,
          dto.gender_id,
        ];
        const userResult = await client.query(insertUserQuery, values);
        user = userResult.rows[0];
      } catch (error: any) {
        if (error.code === '23505') {
          throw new ConflictException(
            'El correo electrónico o el nombre de usuario ya se encuentran registrados.',
          );
        }
        if (error.code === '23503') {
          throw new NotFoundException('El género especificado no existe.');
        }
        throw error;
      }

      // 3. Asignar automáticamente el rol en seguridad.user_roles
      const insertUserRoleQuery = `
        INSERT INTO seguridad.user_roles (user_id, role_id)
        VALUES ($1, $2);
      `;
      await client.query(insertUserRoleQuery, [user.id, roleId]);

      // 4. Retornar el cliente sin la contraseña expuesta
      return {
        ...user,
        role: 'CLIENT',
      };
    });
  }
}
