import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 1. Validar que la cabecera Authorization exista
    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó el token de autenticación.');
    }

    // 2. Validar el formato del token (Debe ser "Bearer <token>")
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido. Debe ser: Bearer <token>');
    }

    try {
      // 3. Obtener la clave secreta del entorno de forma segura
      const secret = this.configService.get<string>('JWT_SECRET');

      // 4. Verificar la validez criptográfica y expiración del Access Token
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // 5. Adjuntar el payload decodificado al objeto request para usarlo en el controlador
      request.user = {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
      };

    } catch (error) {
      // Si el token expiró o fue alterado, lanzamos un 401 claro
      throw new UnauthorizedException('El token ha expirado o es inválido.');
    }

    return true; // Permite el paso hacia el controlador
  }
}