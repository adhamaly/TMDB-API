import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class MovieIdParamDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  movieId: number;
}
