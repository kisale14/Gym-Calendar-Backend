import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { CheckEmailDto } from './dto/check-email.dto.js';
import { CheckUsernameDto } from './dto/check-username.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: any) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    const userId = req.user.userId;
    return this.authService.getProfile(userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.authService.getProfile(userId);
  }

  /**
   * GET /auth/check-email?email=user@example.com
   * Verifica si un email ya está registrado.
   * Endpoint público — no requiere autenticación.
   *
   * Response: { email: string; registered: boolean }
   */
  @Get('check-email')
  checkEmail(@Query() dto: CheckEmailDto) {
    return this.authService.checkEmailExists(dto.email);
  }

  /**
   * GET /auth/check-username?username=johndoe
   * Verifica si un username está disponible.
   * Endpoint público — no requiere autenticación.
   *
   * Response: { username: string; available: boolean }
   */
  @Get('check-username')
  checkUsername(@Query() dto: CheckUsernameDto) {
    return this.authService.checkUsernameAvailable(dto.username);
  }
}

