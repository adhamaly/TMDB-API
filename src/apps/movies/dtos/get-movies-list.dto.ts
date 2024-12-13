import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMoviesListDto {
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  search?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  genreId?: number;
}
