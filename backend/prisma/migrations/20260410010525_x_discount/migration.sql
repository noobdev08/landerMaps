/*
  Warnings:

  - You are about to drop the column `isFree` on the `Map` table. All the data in the column will be lost.
  - You are about to drop the `DiscountCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Map" DROP COLUMN "isFree";

-- DropTable
DROP TABLE "DiscountCode";
