import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { PrismaService } from '../../../lib/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('MoviesService (Database-Only)', () => {
  let service: MoviesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: {
            movie: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {}, // No external API config needed for database-only tests
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });
  describe('getMovies', () => {
    it('should return a paginated list of movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ];

      const totalItems = 20;
      const limit = 2;

      prismaService.movie.findMany = jest.fn().mockResolvedValue(mockMovies);
      prismaService.movie.count = jest.fn().mockResolvedValue(totalItems);

      const totalPages = Math.ceil(totalItems / limit);

      const result = await service.getMovies(1, { page: 1, limit });

      expect(result).toEqual({
        movies: mockMovies,
        totalPages,
        totalItems,
        page: 1,
        limit,
      });

      expect(prismaService.movie.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: limit,
        where: {},
      });
    });
  });
});
