import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginEmailDto {
  @IsString()
  @ApiProperty({ type: String })
  username: string;

  @IsString()
  @ApiProperty({ type: String })
  password: string;
}
