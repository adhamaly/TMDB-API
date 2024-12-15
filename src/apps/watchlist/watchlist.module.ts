import { Module } from '@nestjs/common';
import { WatchListService } from './services/watchlist.service';
import { WatchListController } from './controllers/watchlist.controller';

@Module({
  imports: [],
  providers: [WatchListService],
  controllers: [WatchListController],
})
export class WatchListModule {}
