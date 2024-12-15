import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetWatchListListDto {
  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number;

  @ApiProperty({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number;
}
