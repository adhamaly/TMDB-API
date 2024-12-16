import { Module } from '@nestjs/common';
import { MoviesController } from './controllers/movies.controller';
import { MoviesService } from './services/movies.service';

@Module({
  imports: [],
  providers: [MoviesService],
  controllers: [MoviesController],
})
export class MoviesModule {}
