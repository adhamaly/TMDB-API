import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { SignupUserDto } from '../dtos/signup.dto';
import { LoginEmailDto } from '../dtos/login-email.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginEmailDto: LoginEmailDto) {
    return {
      success: true,
      data: await this.authService.login(loginEmailDto),
    };
  }
}
