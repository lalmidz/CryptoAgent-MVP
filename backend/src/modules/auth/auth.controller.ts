import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto, @Req() req: any) {
    const deviceInfo = {
      name: req.headers['user-agent'] || 'Unknown',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const deviceInfo = {
      name: req.headers['user-agent'] || 'Unknown',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };

    return this.authService.login(loginDto, deviceInfo);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@Req() req: any) {
    return req.user;
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  async setup2FA(@Req() req: any) {
    return this.authService.setupTwoFactor(req.user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify two-factor authentication' })
  async verify2FA(@Body() body: { token: string }, @Req() req: any) {
    if (!body.token) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.verifyTwoFactor(req.user.id, body.token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  async disable2FA(@Req() req: any) {
    await this.authService.disableTwoFactor(req.user.id);
    return { message: '2FA disabled' };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshAccessToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: any, @Body() body: { deviceId?: string }) {
    await this.authService.logout(req.user.id, body.deviceId || 'default');
    return { message: 'Logged out successfully' };
  }
}
