-- AlterTable
ALTER TABLE "ugc_deliverables" ADD COLUMN     "progress" TEXT[] DEFAULT ARRAY[]::TEXT[];
