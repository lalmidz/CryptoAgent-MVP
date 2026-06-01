import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { UserTwoFactor } from './entities/user-2fa.entity';
import { UserDevice } from './entities/user-device.entity';
import { UserSession } from './entities/user-session.entity';

import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserTwoFactor) private twoFactorRepository: Repository<UserTwoFactor>,
    @InjectRepository(UserDevice) private deviceRepository: Repository<UserDevice>,
    @InjectRepository(UserSession) private sessionRepository: Repository<UserSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    const { email, password, username } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      isEmailVerified: false,
      twoFactorEnabled: false,
      role: 'user',
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User registered: ${email}`);

    const accessToken = this.generateAccessToken(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      accessToken,
    };
  }

  async login(loginDto: LoginDto, deviceInfo: any): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Register device
    const deviceHash = this.hashDevice(deviceInfo);
    let device = await this.deviceRepository.findOne({
      where: { userId: user.id, deviceHash },
    });

    if (!device) {
      device = this.deviceRepository.create({
        userId: user.id,
        deviceHash,
        deviceName: deviceInfo.name || 'Unknown Device',
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
      });
      await this.deviceRepository.save(device);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Create session
    const session = this.sessionRepository.create({
      userId: user.id,
      deviceId: device.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await this.sessionRepository.save(session);

    this.logger.log(`User logged in: ${email}`);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateJwt(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async setupTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: 'CryptoAgent',
      issuer: 'CryptoAgent',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Store temporary secret
    let twoFactor = await this.twoFactorRepository.findOne({
      where: { userId },
    });

    if (!twoFactor) {
      twoFactor = this.twoFactorRepository.create({
        userId,
        secret: secret.base32,
        isEnabled: false,
      });
    } else {
      twoFactor.secret = secret.base32;
    }

    await this.twoFactorRepository.save(twoFactor);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { userId },
    });

    if (!twoFactor) {
      throw new BadRequestException('2FA not set up');
    }

    const verified = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Invalid 2FA token');
    }

    if (!twoFactor.isEnabled) {
      twoFactor.isEnabled = true;
      await this.twoFactorRepository.save(twoFactor);
    }

    return true;
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { userId },
    });

    if (twoFactor) {
      twoFactor.isEnabled = false;
      await this.twoFactorRepository.save(twoFactor);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    await this.sessionRepository.delete({
      userId,
      deviceId,
    });

    this.logger.log(`User ${userId} logged out`);
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });
  }

  private hashDevice(deviceInfo: any): string {
    const hash = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(deviceInfo))
      .digest('hex');
    return hash;
  }

  private sanitizeUser(user: User): User {
    const { password, ...result } = user;
    return result as User;
  }
}
