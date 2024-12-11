import { Module } from '@nestjs/common';
import { UserMongooseModule } from 'src/lib/modules/mongoose';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserMongooseModule],
  providers: [AuthService, JwtService],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
