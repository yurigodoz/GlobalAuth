-- AlterTable
ALTER TABLE "App" ADD COLUMN     "accessTokenTtl" TEXT NOT NULL DEFAULT '1h',
ADD COLUMN     "refreshTokenTtl" TEXT NOT NULL DEFAULT '1d';
