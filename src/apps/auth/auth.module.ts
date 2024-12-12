import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  providers: [AuthService, JwtService, PrismaService, ConfigService],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
