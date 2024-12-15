import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './apps/auth/auth.module';
import { PrismaModule } from './lib/prisma/prisma.module';
import { MoviesModule } from './apps/movies/movies.module';
import { WatchListModule } from './apps/watchlist/watchlist.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtVerifyGuard } from './apps/auth/gurads/jwt-verify.guard';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MoviesModule,
    WatchListModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
