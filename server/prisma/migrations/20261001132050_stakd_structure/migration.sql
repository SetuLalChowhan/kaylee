/*
  Warnings:

  - Made the column `planId` on table `purchases` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "purchases" ALTER COLUMN "planId" SET NOT NULL;
