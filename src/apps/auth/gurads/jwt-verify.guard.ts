import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtVerifyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) return false;

    const token = request?.headers?.authorization?.split(' ')[1];
    if (token) {
      let decoded;

      try {
        decoded = this.jwtService.decode(token);
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }

      try {
        this.jwtService.verify(token, {
          secret: this.configService.get<string>('USER_JWT_SECRET'),
        });

        request.persona = decoded;
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
      return true;
    }
    throw new UnauthorizedException('No token provided');
  }
}
