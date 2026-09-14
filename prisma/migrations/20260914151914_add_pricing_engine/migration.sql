-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PriceAction" AS ENUM ('INCREASE', 'DECREASE', 'MAINTAIN', 'REQUIRE_DIAGNOSTIC_FEE', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING_REVIEW', 'AUTO_APPROVED', 'APPROVED', 'REJECTED', 'EDITED');

-- CreateEnum
CREATE TYPE "AgentName" AS ENUM ('ORCHESTRATOR', 'COST_AGENT', 'PRICING_AGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'OWNER';
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'SALES';

-- AlterTable
ALTER TABLE "Repair" ADD COLUMN     "estimatedTechnicianHours" DOUBLE PRECISION,
ADD COLUMN     "repairCategoryId" TEXT;

-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "capacityHoursPerWeek" DOUBLE PRECISION,
ADD COLUMN     "hourlyCostCents" INTEGER;

-- CreateTable
CREATE TABLE "RepairCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "defaultLaborHours" DOUBLE PRECISION NOT NULL,
    "defaultDiagnosticHours" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "defaultPartsCostCents" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'global',
    "minimumMarginPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "targetMarginPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.55,
    "minimumDiagnosticFeeCents" INTEGER NOT NULL DEFAULT 4900,
    "minimumRepairPriceCents" INTEGER NOT NULL DEFAULT 4900,
    "maximumDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "rushMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.25,
    "complexityMultiplierMax" DOUBLE PRECISION NOT NULL DEFAULT 1.30,
    "riskMultiplierMax" DOUBLE PRECISION NOT NULL DEFAULT 1.20,
    "premiumFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.15,
    "maximumJustifiedMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.6,
    "warrantyReservePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.04,
    "overheadAllocationPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.08,
    "paymentProcessingPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.029,
    "paymentProcessingFixedCents" INTEGER NOT NULL DEFAULT 30,
    "technicianHourlyCostCents" INTEGER NOT NULL DEFAULT 4500,
    "capacityHighThresholdPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.90,
    "capacityLowThresholdPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "approvalConfidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.55,
    "manualReviewOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRecommendation" (
    "id" TEXT NOT NULL,
    "repairCategoryId" TEXT,
    "repairId" TEXT,
    "partsCostCents" INTEGER NOT NULL,
    "laborHours" DOUBLE PRECISION NOT NULL,
    "technicianHourlyCostCents" INTEGER NOT NULL,
    "shippingCostCents" INTEGER NOT NULL,
    "paymentCostCents" INTEGER NOT NULL,
    "consumablesCostCents" INTEGER NOT NULL,
    "warrantyReserveCents" INTEGER NOT NULL,
    "overheadCents" INTEGER NOT NULL,
    "estimatedTotalCostCents" INTEGER NOT NULL,
    "priceFloorCents" INTEGER NOT NULL,
    "competitivePriceCents" INTEGER,
    "recommendedPriceCents" INTEGER NOT NULL,
    "premiumPriceCents" INTEGER NOT NULL,
    "maxJustifiedPriceCents" INTEGER NOT NULL,
    "grossProfitCents" INTEGER NOT NULL,
    "grossMarginPercent" DOUBLE PRECISION NOT NULL,
    "profitPerTechnicianHourCents" INTEGER,
    "estimatedAcceptanceProbability" DOUBLE PRECISION NOT NULL,
    "expectedContributionProfitCents" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "priceAction" "PriceAction" NOT NULL,
    "reasoning" TEXT[],
    "riskFlags" TEXT[],
    "requiresHumanApproval" BOOLEAN NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "finalPriceCents" INTEGER,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "agentName" "AgentName" NOT NULL,
    "taskDescription" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "inputSummary" JSONB NOT NULL,
    "outputSummary" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "latencyMs" INTEGER NOT NULL,
    "tokenEstimate" INTEGER,
    "costEstimateCents" INTEGER,
    "succeeded" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pricingRecommendationId" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepairCategory_slug_key" ON "RepairCategory"("slug");

-- CreateIndex
CREATE INDEX "RepairCategory_slug_idx" ON "RepairCategory"("slug");

-- CreateIndex
CREATE INDEX "RepairCategory_isActive_idx" ON "RepairCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PricingRule_key_key" ON "PricingRule"("key");

-- CreateIndex
CREATE INDEX "PricingRule_key_idx" ON "PricingRule"("key");

-- CreateIndex
CREATE INDEX "PricingRecommendation_repairCategoryId_idx" ON "PricingRecommendation"("repairCategoryId");

-- CreateIndex
CREATE INDEX "PricingRecommendation_repairId_idx" ON "PricingRecommendation"("repairId");

-- CreateIndex
CREATE INDEX "PricingRecommendation_status_idx" ON "PricingRecommendation"("status");

-- CreateIndex
CREATE INDEX "PricingRecommendation_createdAt_idx" ON "PricingRecommendation"("createdAt");

-- CreateIndex
CREATE INDEX "AgentRun_agentName_idx" ON "AgentRun"("agentName");

-- CreateIndex
CREATE INDEX "AgentRun_pricingRecommendationId_idx" ON "AgentRun"("pricingRecommendationId");

-- CreateIndex
CREATE INDEX "AgentRun_createdAt_idx" ON "AgentRun"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "Repair_repairCategoryId_idx" ON "Repair"("repairCategoryId");

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_repairCategoryId_fkey" FOREIGN KEY ("repairCategoryId") REFERENCES "RepairCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRecommendation" ADD CONSTRAINT "PricingRecommendation_repairCategoryId_fkey" FOREIGN KEY ("repairCategoryId") REFERENCES "RepairCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRecommendation" ADD CONSTRAINT "PricingRecommendation_repairId_fkey" FOREIGN KEY ("repairId") REFERENCES "Repair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRecommendation" ADD CONSTRAINT "PricingRecommendation_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_pricingRecommendationId_fkey" FOREIGN KEY ("pricingRecommendationId") REFERENCES "PricingRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
