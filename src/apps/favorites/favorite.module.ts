import { Module } from '@nestjs/common';
import { FavoriteService } from './services/favorite.service';
import { FavoriteController } from './controllers/favorite.controller';

@Module({
  imports: [],
  providers: [FavoriteService],
  controllers: [FavoriteController],
})
export class FavoriteModule {}
