import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupUserDto } from '../dtos/signup.dto';
import { LoginEmailDto } from '../dtos/login-email.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async signup({ email, password, username }: SignupUserDto) {
    const isEmailAlreadyExists = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (isEmailAlreadyExists) {
      throw new UnauthorizedException('Email is already exists');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      Number(this.configService.get<number>('SALT')),
    );

    const createdUser = await this.prismaService.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
      },
    });

    delete createdUser.password;
    return createdUser;
  }

  async login({ email, password }: LoginEmailDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new UnauthorizedException('Incorrect Email or password');
    }

    delete user.password;

    const token = this.generateToken(user);

    return {
      ...user,
      token,
    };
  }

  private generateToken(user: User) {
    return this.jwtService.sign(
      { _id: String(user.id), email: user.email },
      {
        secret: this.configService.get<string>('USER_JWT_SECRET'),
        expiresIn:
          Number(this.configService.get<number>('USER_JWT_EXPIRY')) || 1200,
      },
    );
  }
}
