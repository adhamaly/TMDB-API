import { Test, TestingModule } from '@nestjs/testing';
import { WatchListService } from './watchlist.service';
import { PrismaService } from '../../../lib/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

describe('WatchListService', () => {
  let service: WatchListService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchListService,
        {
          provide: PrismaService,
          useValue: {
            watchList: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            movie: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mockTMDBAPIUrl'), // Mock TMDB API URL
          },
        },
      ],
    }).compile();

    service = module.get<WatchListService>(WatchListService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getWatchList', () => {
    it('should return a paginated list of movies in the watchlist', async () => {
      const userId = 1;
      const query = { page: 1, limit: 2 }; // Pagination query
      const mockWatchList = [
        { id: 1, movie: { id: 1, title: 'Movie 1' } },
        { id: 2, movie: { id: 2, title: 'Movie 2' } },
      ];
      const mockWatchListCount = 2;

      // Mock the Prisma service methods
      prismaService.watchList.findMany = jest
        .fn()
        .mockResolvedValue(mockWatchList);
      prismaService.watchList.count = jest
        .fn()
        .mockResolvedValue(mockWatchListCount);

      const result = await service.getWatchList(userId, query);

      expect(result).toEqual({
        watchList: mockWatchList.map((item) => item.movie),
        totalPages: Math.ceil(mockWatchListCount / query.limit),
        totalItems: mockWatchListCount,
        page: query.page,
        limit: query.limit,
      });

      expect(prismaService.watchList.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0, // Since we're on page 1
        take: query.limit,
        select: {
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
      });

      expect(prismaService.watchList.count).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should handle errors gracefully when Prisma query fails', async () => {
      const userId = 1;
      const query = { page: 1, limit: 5 };

      prismaService.watchList.findMany = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getWatchList(userId, query)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });
});
