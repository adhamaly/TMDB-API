import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './apps/auth/auth.module';
import { PrismaModule } from './lib/prisma/prisma.module';
import { MoviesModule } from './apps/movies/movies.module';
import { WatchListModule } from './apps/watchlist/watchlist.module';
import { FavoriteModule } from './apps/favorites/favorite.module';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MoviesModule,
    WatchListModule,
    FavoriteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
