/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `ugc_campaigns` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ugc_campaigns" ADD COLUMN     "shareEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shareExpiresAt" TIMESTAMP(3),
ADD COLUMN     "shareToken" TEXT;

-- CreateTable
CREATE TABLE "ugc_brand_sessions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ugc_brand_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_otps" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ugc_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_approval_audit" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "mediaId" TEXT,
    "action" TEXT NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ugc_approval_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ugc_rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ugc_rate_limits_key_key" ON "ugc_rate_limits"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ugc_campaigns_shareToken_key" ON "ugc_campaigns"("shareToken");

-- AddForeignKey
ALTER TABLE "ugc_brand_sessions" ADD CONSTRAINT "ugc_brand_sessions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ugc_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ugc_otps" ADD CONSTRAINT "ugc_otps_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ugc_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ugc_approval_audit" ADD CONSTRAINT "ugc_approval_audit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ugc_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
