import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupUserDto {
  @IsEmail()
  @ApiProperty({ type: String })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  password: string;
}
