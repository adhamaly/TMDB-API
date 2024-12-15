import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddMovieToFavorite {
  @ApiProperty({ type: Number })
  @IsNumber()
  movieId: number;
}
