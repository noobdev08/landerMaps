/*
  Warnings:

  - Added the required column `filePath` to the `Map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailPath` to the `Map` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Map" ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "thumbnailPath" TEXT NOT NULL;
