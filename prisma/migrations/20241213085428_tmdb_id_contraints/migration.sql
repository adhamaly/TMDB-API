/*
  Warnings:

  - A unique constraint covering the columns `[tmdbGenreId]` on the table `Genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbMovieId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbWatchListId]` on the table `Watchlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Genre_tmdbGenreId_key" ON "Genre"("tmdbGenreId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbMovieId_key" ON "Movie"("tmdbMovieId");

-- CreateIndex
CREATE UNIQUE INDEX "User_tmdbUserId_key" ON "User"("tmdbUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_tmdbWatchListId_key" ON "Watchlist"("tmdbWatchListId");
