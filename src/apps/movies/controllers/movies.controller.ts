import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MoviesService } from '../services/movies.service';
import { GetMoviesListDto } from '../dtos/get-movies-list.dto';

@Controller('movies')
@ApiTags('Movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get()
  async getMovies(@Query() query: GetMoviesListDto) {
    return {
      success: true,
      data: await this.moviesService.getMovies(query),
    };
  }

  @Post('sync-genres')
  async syncGenres() {
    await this.moviesService.syncGenres();
    return {
      success: true,
    };
  }

  @Get('sync-movies')
  async syncMovies() {
    await this.moviesService.syncMovies();
    return {
      success: true,
    };
  }
}
