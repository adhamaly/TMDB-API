/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId]` on the table `WatchList` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WatchList_userId_movieId_key" ON "WatchList"("userId", "movieId");
