-- AlterEnum
ALTER TYPE "AgentName" ADD VALUE 'MARKETING_ORCHESTRATOR';
ALTER TYPE "AgentName" ADD VALUE 'MARKETING_GUARDIAN';
ALTER TYPE "AgentName" ADD VALUE 'MARKETING_CREATIVE';

-- CreateEnum
CREATE TYPE "MarketingChannel" AS ENUM ('GOOGLE_SEARCH', 'GOOGLE_LSA', 'META', 'TIKTOK', 'YOUTUBE', 'EMAIL', 'ORGANIC_SITE');

-- CreateEnum
CREATE TYPE "MarketingDraftType" AS ENUM ('CAMPAIGN_LAUNCH', 'BUDGET_CHANGE', 'AD_CREATIVE', 'SOCIAL_POST', 'EMAIL_SEND');

-- CreateEnum
CREATE TYPE "MarketingDraftStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "GuardrailAction" AS ENUM ('WATCH', 'FLAG_FOR_REVIEW', 'AUTO_PAUSE', 'AUTO_REALLOCATE');

-- CreateEnum
CREATE TYPE "FunnelCheckStatus" AS ENUM ('OK', 'DEGRADED', 'DOWN');

-- CreateTable
CREATE TABLE "MarketingDraft" (
    "id" TEXT NOT NULL,
    "type" "MarketingDraftType" NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "rationale" TEXT,
    "guardrailAction" "GuardrailAction",
    "status" "MarketingDraftStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdByAgent" "AgentName" NOT NULL,
    "sourceAgentRunId" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingLesson" (
    "id" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "tag" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "confidence" TEXT NOT NULL,
    "sourceDraftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunnelCheck" (
    "id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "FunnelCheckStatus" NOT NULL,
    "httpStatus" INTEGER,
    "latencyMs" INTEGER,
    "errorDetail" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunnelCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingDraft_status_idx" ON "MarketingDraft"("status");

-- CreateIndex
CREATE INDEX "MarketingDraft_channel_idx" ON "MarketingDraft"("channel");

-- CreateIndex
CREATE INDEX "MarketingDraft_type_idx" ON "MarketingDraft"("type");

-- CreateIndex
CREATE INDEX "MarketingDraft_createdAt_idx" ON "MarketingDraft"("createdAt");

-- CreateIndex
CREATE INDEX "MarketingLesson_channel_idx" ON "MarketingLesson"("channel");

-- CreateIndex
CREATE INDEX "MarketingLesson_tag_idx" ON "MarketingLesson"("tag");

-- CreateIndex
CREATE INDEX "MarketingLesson_createdAt_idx" ON "MarketingLesson"("createdAt");

-- CreateIndex
CREATE INDEX "FunnelCheck_target_idx" ON "FunnelCheck"("target");

-- CreateIndex
CREATE INDEX "FunnelCheck_status_idx" ON "FunnelCheck"("status");

-- CreateIndex
CREATE INDEX "FunnelCheck_checkedAt_idx" ON "FunnelCheck"("checkedAt");

-- AddForeignKey
ALTER TABLE "MarketingDraft" ADD CONSTRAINT "MarketingDraft_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
