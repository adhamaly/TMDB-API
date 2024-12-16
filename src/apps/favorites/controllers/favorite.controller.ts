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
import { FavoriteService } from '../services/favorite.service';
import { GetFavoriteListDto } from '../dtos/get-favorites-list.dto';
import { Persona } from 'src/lib/decorators';
import { JwtVerifyGuard } from 'src/apps/auth/gurads/jwt-verify.guard';
import { UserJwtPersona } from 'src/lib/interfaces/jwt-persona';
import { AddMovieToFavorite } from '../dtos/add-movie-favorite.dto';
import { RemoveMovieToFavoriteDto } from '../dtos/remove-movie-favorite.dto';

@Controller('favorites')
@ApiTags('Favorites')
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtVerifyGuard)
  async getFavorite(
    @Persona() userJwtPersona: UserJwtPersona,
    @Query() query: GetFavoriteListDto,
  ) {
    return {
      success: true,
      data: await this.favoriteService.getFavorite(userJwtPersona.id, query),
    };
  }

  @Get('sync')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async syncFavorite(@Persona() userJwtPersona: UserJwtPersona) {
    await this.favoriteService.syncFavoriteFromTMDB(userJwtPersona.id);
    return {
      success: true,
    };
  }

  @Post('add')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async addMovieToFavorite(
    @Persona() userJwtPersona: UserJwtPersona,
    @Body() addMovieToFavorite: AddMovieToFavorite,
  ) {
    await this.favoriteService.addToFavorite(
      userJwtPersona.id,
      addMovieToFavorite,
    );
    return {
      success: true,
    };
  }

  @Delete('remove')
  @UseGuards(JwtVerifyGuard)
  @ApiBearerAuth()
  async removeMovieToFavorite(
    @Persona() userJwtPersona: UserJwtPersona,
    @Body() removeMovieToFavoriteDto: RemoveMovieToFavoriteDto,
  ) {
    await this.favoriteService.removeFromFavorite(
      userJwtPersona.id,
      removeMovieToFavoriteDto,
    );
    return {
      success: true,
    };
  }
}
