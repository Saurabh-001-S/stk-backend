/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_tradeId_fkey";

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "image" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "Image";
