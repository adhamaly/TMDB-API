import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginEmailDto {
  @IsEmail()
  @ApiProperty({ type: String })
  email: string;

  @IsString()
  @ApiProperty({ type: String })
  password: string;
}
