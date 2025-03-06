import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpirition = '10m';
  private readonly refreshTokenExpirition = '7d';

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'default_access_secret';
    this.refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'default_refresh_secret';
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpirition,
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpirition,
    });
  }
}
