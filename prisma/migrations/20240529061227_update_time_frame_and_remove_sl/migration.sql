/*
  Warnings:

  - The values [MIN2,HOUR1] on the enum `entryTimeFrame` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sl` on the `Trade` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "entryTimeFrame_new" AS ENUM ('MIN1', 'MIN5', 'MIN15');
ALTER TABLE "Trade" ALTER COLUMN "entryTimeFrame" TYPE "entryTimeFrame_new" USING ("entryTimeFrame"::text::"entryTimeFrame_new");
ALTER TYPE "entryTimeFrame" RENAME TO "entryTimeFrame_old";
ALTER TYPE "entryTimeFrame_new" RENAME TO "entryTimeFrame";
DROP TYPE "entryTimeFrame_old";
COMMIT;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "sl";
