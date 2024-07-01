-- CreateEnum
CREATE TYPE "Region" AS ENUM ('FOREX', 'IND');

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "region" "Region" NOT NULL DEFAULT 'IND';
