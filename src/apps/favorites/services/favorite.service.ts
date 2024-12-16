import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { GetFavoriteListDto } from '../dtos/get-favorites-list.dto';
import { AddMovieToFavorite } from '../dtos/add-movie-favorite.dto';
import { RemoveMovieToFavoriteDto } from '../dtos/remove-movie-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async syncFavoriteFromTMDB(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: Number(userId) },
    });
    const options = {
      method: 'GET',
      url: `${this.configService.get<string>('TMDB_API_URL')}/account/${
        user.tmdbUserId
      }/favorite/movies`,
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
        await prisma.favorite.deleteMany({
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
              favorites: {
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
              favorites: {
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

  async getFavorite(userId: number, query: GetFavoriteListDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const favorites = await this.prismaService.favorite.findMany({
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
    const favoriteCount = await this.prismaService.favorite.count({
      where: {
        userId: Number(userId),
      },
    });

    return {
      favorites,
      totalPages: Math.ceil(favoriteCount / limit) || 0,
      totalItems: favoriteCount,
      page: Number(page),
      limit: Number(limit),
    };
  }

  private async migrateFavoriteToTMDB(
    tmdbUserId: number,
    tmdbMovieId: number,
    favorite: boolean,
  ) {
    const options = {
      method: 'POST',
      url: `${this.configService.get<string>(
        'TMDB_API_URL',
      )}/account/${tmdbUserId}/favorite`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.configService.get<string>(
          'TMDB_API_KEY',
        )}`,
      },
      data: {
        media_type: 'movie',
        media_id: Number(tmdbMovieId),
        favorite: favorite,
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

  async addToFavorite(userId: number, { movieId }: AddMovieToFavorite) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (
      await this.prismaService.favorite.findFirst({
        where: { movieId: Number(movieId), userId: Number(userId) },
      })
    ) {
      throw new NotFoundException('Movie already added to Favorite');
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: Number(userId) },
    });

    await this.prismaService.favorite.create({
      data: {
        movieId: Number(movieId),
        userId: Number(userId),
      },
    });

    await this.migrateFavoriteToTMDB(user.tmdbUserId, movie.tmdbMovieId, true);
  }

  async removeFromFavorite(
    userId: number,
    { movieId }: RemoveMovieToFavoriteDto,
  ) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const userMovieFavorite = await this.prismaService.favorite.findFirst({
      where: { movieId: Number(movieId), userId: Number(userId) },
      select: {
        user: {
          select: {
            tmdbUserId: true,
          },
        },
      },
    });

    if (!userMovieFavorite) {
      throw new NotFoundException('Movie was not added to Favorite');
    }

    await this.prismaService.favorite.delete({
      where: {
        userId_movieId: { movieId: Number(movieId), userId: Number(userId) },
      },
    });

    await this.migrateFavoriteToTMDB(
      userMovieFavorite.user.tmdbUserId,
      movie.tmdbMovieId,
      false,
    );
  }
}
