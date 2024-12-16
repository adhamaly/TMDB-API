/*
  Warnings:

  - You are about to drop the column `tmdbWatchListId` on the `Watchlist` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Watchlist_tmdbWatchListId_key";

-- AlterTable
ALTER TABLE "Watchlist" DROP COLUMN "tmdbWatchListId";
