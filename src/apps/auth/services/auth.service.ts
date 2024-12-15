import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginEmailDto } from '../dtos/login-email.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { User } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  private async createRequestToken() {
    const options = {
      method: 'GET',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/authentication/token/new`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
    };

    try {
      const requestToken = await axios.request(options);
      return requestToken.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  private async createSessionId(loginEmailDto: LoginEmailDto) {
    const requestToken = await this.createRequestToken();

    await this.validateRequestTokenWithLogin(
      loginEmailDto,
      requestToken.request_token,
    );

    const options = {
      method: 'POST',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/authentication/session/new`,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
      data: { request_token: requestToken.request_token },
    };

    try {
      const sessionData = await axios.request(options);
      return sessionData.data.session_id;
    } catch (error) {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  private async validateRequestTokenWithLogin(
    { username, password }: LoginEmailDto,
    requestToken: string,
  ) {
    const options = {
      method: 'POST',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/authentication/token/validate_with_login`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
      data: {
        username: username,
        password: password,
        request_token: requestToken,
      },
    };

    try {
      const requestTokenResponse = await axios.request(options);

      if (requestTokenResponse.data.request_token != requestToken) {
        throw new UnauthorizedException('Invalid username or password');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  private async getUserAccountDetails(sessionId: string) {
    const options = {
      method: 'GET',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/account/account_id?session_id=${sessionId}`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
    };

    try {
      const accountData = await axios.request(options);
      return accountData.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid username or password');
    }
  }

  async login(loginEmailDto: LoginEmailDto) {
    const { username } = loginEmailDto;
    const sessionId = await this.createSessionId(loginEmailDto);

    if (!sessionId) {
      throw new UnauthorizedException('Invalid username or password');
    }

    let user: User;
    user = await this.prismaService.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      const userAccountDetails = await this.getUserAccountDetails(sessionId);

      user = await this.prismaService.user.create({
        data: {
          username,
          tmdbUserId: userAccountDetails.id,
        },
      });
    }

    return {
      ...user,
      token: this.generateToken(user),
    };
  }

  private generateToken(user: User) {
    return this.jwtService.sign(
      { id: String(user.id), username: user.username },
      {
        secret: this.configService.get<string>('USER_JWT_SECRET'),
        expiresIn:
          Number(this.configService.get<number>('USER_JWT_EXPIRY')) || 3600,
      },
    );
  }
}
