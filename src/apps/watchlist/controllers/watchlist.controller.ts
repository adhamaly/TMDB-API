import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WatchListService } from '../services/watchlist.service';
import { GetWatchListListDto } from '../dtos/get-watchlist-list.dto';
import { Persona } from 'src/lib/decorators';
import { JwtVerifyGuard } from 'src/apps/auth/gurads/jwt-verify.guard';
import { UserJwtPersona } from 'src/lib/interfaces/jwt-persona';
import { AddMovieToWatchList } from '../dtos/add-movie-watchlist.dto';
import { RemoveMovieToWatchListDto } from '../dtos/remove-movie-watchlist.dto';

@Controller('watch-lists')
@ApiTags('WatchList')
export class WatchListController {
  constructor(private watchListService: WatchListService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtVerifyGuard)
  async getWatchList(
    @Persona() userJwtPersona: UserJwtPersona,
    @Query() query: GetWatchListListDto,
  ) {
    return {
      success: true,
      data: await this.watchListService.getWatchList(userJwtPersona.id, query),
    };
  }

  @Get('sync')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async syncWatchList(@Persona() userJwtPersona: UserJwtPersona) {
    await this.watchListService.syncWatchListFromTMDB(userJwtPersona.id);
    return {
      success: true,
    };
  }

  @Post('add')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async addMovieToWatchList(
    @Persona() userJwtPersona: UserJwtPersona,
    @Body() AddMovieToWatchList: AddMovieToWatchList,
  ) {
    await this.watchListService.addToWatchList(
      userJwtPersona.id,
      AddMovieToWatchList,
    );
    return {
      success: true,
    };
  }

  @Delete('remove')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async removeMovieToWatchList(
    @Persona() userJwtPersona: UserJwtPersona,
    @Body() removeMovieToWatchListDto: RemoveMovieToWatchListDto,
  ) {
    await this.watchListService.removeFromWatchList(
      userJwtPersona.id,
      removeMovieToWatchListDto,
    );
    return {
      success: true,
    };
  }
}
