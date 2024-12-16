import { Module } from '@nestjs/common';
import { MoviesController } from './controllers/movies.controller';
import { MoviesService } from './services/movies.service';
import { ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@songkeys/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        return {
          config: {
            host: configService.get<string>('REDIS_HOST') ?? 'redis',
            port: Number(configService.get<string>('REDIS_PORT')) ?? 6380,
          },
        };
      },
    }),
  ],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
