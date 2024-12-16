import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MoviesService } from '../services/movies.service';
import { GetMoviesListDto } from '../dtos/get-movies-list.dto';
import { JwtVerifyGuard } from 'src/apps/auth/gurads/jwt-verify.guard';
import { Persona } from 'src/lib/decorators';
import { UserJwtPersona } from 'src/lib/interfaces/jwt-persona';
import { MovieIdParamDto } from '../dtos/movie-id-params.dto';
import { CreateRateMovieDto } from '../dtos/rate-movie.dto';

@Controller('movies')
@ApiTags('Movies')
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Get()
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async getMovies(
    @Persona() userJwtPersona: UserJwtPersona,
    @Query() query: GetMoviesListDto,
  ) {
    return {
      success: true,
      data: await this.moviesService.getMovies(userJwtPersona.id, query),
    };
  }

  @Get('sync-genres')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async syncGenres() {
    await this.moviesService.syncGenres();
    return {
      success: true,
    };
  }

  @Get('sync-movies')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async syncMovies() {
    await this.moviesService.syncMovies();
    return {
      success: true,
    };
  }

  @Get('details/:movieId')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async getMovieDetails(
    @Persona() userJwtPersona: UserJwtPersona,
    @Param() param: MovieIdParamDto,
  ) {
    return {
      success: true,
      data: await this.moviesService.getMovie(userJwtPersona.id, param),
    };
  }

  @Post('rating/:movieId')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async rateMovie(
    @Persona() userJwtPersona: UserJwtPersona,
    @Param() param: MovieIdParamDto,
    @Body() createRateMovieDto: CreateRateMovieDto,
  ) {
    return {
      success: true,
      data: await this.moviesService.rateMovie(
        userJwtPersona.id,
        param,
        createRateMovieDto,
      ),
    };
  }
}
