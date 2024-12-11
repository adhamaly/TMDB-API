import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupUserDto } from '../dtos/signup.dto';
import { ModelNames } from 'src/lib/enums';
import { IUserModel, User } from 'src/lib/mongo';
import { LoginEmailDto } from '../dtos/login-email.dto';
import { HydratedDocument } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ModelNames.USER) private userModel: IUserModel,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup({ email, password, username }: SignupUserDto) {
    const isEmailAlreadyExists = await this.userModel.exists({ email });

    if (isEmailAlreadyExists) {
      throw new UnauthorizedException('Email is already exists');
    }

    const createdUser = new this.userModel();
    createdUser.set({ email, password, username });

    const savedUser = (await createdUser.save()).toJSON();

    return savedUser;
  }

  async login({ email, password }: LoginEmailDto) {
    const user = await this.userModel.findOne({ email });

    const isPasswordMatches = await user.comparePassword(password);
    if (!isPasswordMatches) {
      throw new UnauthorizedException('Incorrect Email or password');
    }

    const savedUser = user.toJSON();
    delete savedUser.password;

    const token = this.generateToken(user);

    return {
      ...savedUser,
      token,
    };
  }

  private generateToken(user: HydratedDocument<User>) {
    return this.jwtService.sign(
      { _id: String(user._id), email: user.email },
      {
        secret: this.configService.get<string>('USER_JWT_SECRET'),
        expiresIn:
          Number(this.configService.get<number>('USER_JWT_EXPIRY')) || 1200,
      },
    );
  }
}
