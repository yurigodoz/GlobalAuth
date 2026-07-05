/*
  Warnings:

  - Made the column `frontendUrl` on table `App` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "App" ALTER COLUMN "frontendUrl" SET NOT NULL;
