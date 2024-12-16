import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { GetMoviesListDto } from '../dtos/get-movies-list.dto';
import { MovieIdParamDto } from '../dtos/movie-id-params.dto';
import { CreateRateMovieDto } from '../dtos/rate-movie.dto';
import { PrismaService } from '../../../lib/prisma/prisma.service';
import { RedisService } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class MoviesService {
  protected readonly redis: Redis;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  async syncGenres() {
    const options = {
      method: 'GET',
      url: `${this.configService.get<string>('TMDB_API_URL')}/genre/movie/list`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
    };
    try {
      const response = await axios.request(options);
      const genres = response.data.genres;
      for (const genre of genres) {
        await this.prismaService.genre.upsert({
          where: { tmdbGenreId: genre.id },
          update: {},
          create: {
            tmdbGenreId: genre.id,
            name: genre.name,
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  async syncMovies() {
    const options = {
      method: 'GET',
      url: `${this.configService.get<string>('TMDB_API_URL')}/discover/movie`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
    };
    try {
      const response = await axios.request(options);
      const movies = response.data.results;
      for (const movie of movies) {
        await this.prismaService.movie.upsert({
          where: { tmdbMovieId: movie.id },
          update: {
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count,
            ...(movie.popularity && { popularity: movie.popularity }),
          },
          create: {
            tmdbMovieId: movie.id,
            title: movie.title,
            overview: movie.overview,
            adult: movie.adult,
            voteAverage: movie.vote_average,
            voteCount: movie.vote_count,
            movieGenre: movie.genre_ids,
            ...(movie.popularity && { popularity: movie.popularity }),
            ...(movie.release_date && { releaseDate: movie.release_date }),
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  async getMovies(userId: number, query: GetMoviesListDto) {
    const { page = 1, limit = 10, search, genreId } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `movies_page_${page}_limit_${limit}`;

    // Check if cached data exists
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return JSON.parse(cachedData);
    }

    const movies = await this.prismaService.movie.findMany({
      where: {
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        ...(genreId && { movieGenre: { has: Number(genreId) } }),
      },
      skip: skip,
      take: Number(limit),
    });
    const moviesCount = await this.prismaService.movie.count({});

    const result = {
      movies,
      totalPages: Math.ceil(moviesCount / limit) || 0,
      totalItems: moviesCount,
      page: Number(page),
      limit: Number(limit),
    };

    // Cache the result in Redis
    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Cache for 1 hour

    return result;
  }

  async getMovie(userId: number, { movieId }: MovieIdParamDto) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!movie) throw new NotFoundException('Movie not found');

    return movie;
  }

  private async migrateRatingsToTMDB(tmdbMovieId: number, rating: number) {
    const options = {
      method: 'POST',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/movie/${tmdbMovieId}/rating`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
      data: {
        value: rating,
      },
    };
    try {
      await axios.request(options);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  async rateMovie(
    userId: number,
    { movieId }: MovieIdParamDto,
    { rating }: CreateRateMovieDto,
  ) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new Error('Movie not found');
    }

    // Calculate new vote average
    const { voteAverage, voteCount } = movie;
    const updatedVoteCount = voteCount + 1;
    const updatedVoteAverage =
      (voteAverage * voteCount + rating) / updatedVoteCount;

    await this.prismaService.$transaction([
      this.prismaService.movie.update({
        where: { id: movieId },
        data: {
          voteAverage: updatedVoteAverage,
          voteCount: updatedVoteCount,
        },
      }),

      this.prismaService.rating.create({
        data: {
          userId: Number(userId),
          movieId: Number(movieId),
          rating,
        },
      }),
    ]);

    await this.migrateRatingsToTMDB(movie.tmdbMovieId, rating);
  }
}
