import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateRateMovieDto {
  @IsNumber()
  @ApiProperty({ type: Number })
  rating: number;
}
