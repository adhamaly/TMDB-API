import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../lib/prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { GetWatchListListDto } from '../dtos/get-watchlist-list.dto';
import { AddMovieToWatchList } from '../dtos/add-movie-watchlist.dto';
import { RemoveMovieToWatchListDto } from '../dtos/remove-movie-watchlist.dto';

@Injectable()
export class WatchListService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async syncWatchListFromTMDB(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: Number(userId) },
    });
    const options = {
      method: 'GET',
      url: `${this.configService.get<string>('TMDB_API_URL')}/account/${
        user.tmdbUserId
      }/watchlist/movies`,
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

      await this.prismaService.$transaction(async (prisma) => {
        await prisma.watchList.deleteMany({
          where: {
            userId: Number(userId),
          },
        });

        for (const movie of movies) {
          // Upsert the movie record
          await prisma.movie.upsert({
            where: { tmdbMovieId: Number(movie.id) },
            update: {
              voteAverage: movie.vote_average,
              voteCount: movie.vote_count,
              ...(movie.popularity && { popularity: movie.popularity }),
              watchList: {
                create: {
                  userId: Number(userId),
                },
              },
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
              watchList: {
                create: {
                  userId: Number(userId),
                },
              },
            },
          });
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong, please try again',
      );
    }
  }

  async getWatchList(userId: number, query: GetWatchListListDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const watchList = await this.prismaService.watchList.findMany({
      where: {
        userId: Number(userId),
      },
      select: {
        id: false,
        userId: false,
        movie: {
          select: {
            id: true,
            title: true,
            adult: true,
            overview: true,
            popularity: true,
            releaseDate: true,
            voteAverage: true,
            voteCount: true,
          },
        },
      },
      skip: skip,
      take: Number(limit),
    });
    const watchListCount = await this.prismaService.watchList.count({
      where: {
        userId: Number(userId),
      },
    });

    return {
      watchList,
      totalPages: Math.ceil(watchListCount / limit) || 0,
      totalItems: watchListCount,
      page: Number(page),
      limit: Number(limit),
    };
  }

  private async migrateWatchListToTMDB(
    tmdbUserId: number,
    tmdbMovieId: number,
    washlist: boolean,
  ) {
    const options = {
      method: 'POST',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/account/${tmdbUserId}/watchlist`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
      data: {
        media_type: 'movie',
        media_id: Number(tmdbMovieId),
        watchlist: washlist,
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

  async addToWatchList(userId: number, { movieId }: AddMovieToWatchList) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const userMovieWatchList = await this.prismaService.watchList.findFirst({
      where: { movieId: Number(movieId), userId: Number(userId) },
      select: {
        user: {
          select: {
            tmdbUserId: true,
          },
        },
      },
    });

    if (userMovieWatchList) {
      throw new NotFoundException('Movie already added to WatchList');
    }

    await this.prismaService.watchList.create({
      data: {
        movieId: Number(movieId),
        userId: Number(userId),
      },
    });

    await this.migrateWatchListToTMDB(
      userMovieWatchList.user.tmdbUserId,
      movie.tmdbMovieId,
      true,
    );
  }

  async removeFromWatchList(
    userId: number,
    { movieId }: RemoveMovieToWatchListDto,
  ) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const userMovieWatchList = await this.prismaService.watchList.findFirst({
      where: { movieId: Number(movieId), userId: Number(userId) },
      select: {
        user: {
          select: {
            tmdbUserId: true,
          },
        },
      },
    });

    if (!userMovieWatchList) {
      throw new NotFoundException('Movie was not added to WatchList');
    }

    await this.prismaService.watchList.delete({
      where: {
        userId_movieId: { movieId: Number(movieId), userId: Number(userId) },
      },
    });

    await this.migrateWatchListToTMDB(
      userMovieWatchList.user.tmdbUserId,
      movie.tmdbMovieId,
      false,
    );
  }
}
