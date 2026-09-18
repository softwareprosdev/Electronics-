# Database Architecture

PostgreSQL + Prisma, extending the existing schema in `prisma/schema.prisma`
additively. This document covers the models added for the revenue/pricing
platform, and reserves the model names for future phases (per
`AGENT_SPECIFICATIONS.md`) so future migrations are additive too.

## New enums

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  OWNER        // NEW — full business/financial visibility, rule editing
  MANAGER      // NEW — pricing review/approval, no rule editing
  SALES        // NEW — quote creation, no pricing-rule access
  TECHNICIAN
  FRONT_DESK
}

enum RiskLevel { LOW MEDIUM HIGH }

enum PriceAction {
  INCREASE
  DECREASE
  MAINTAIN
  REQUIRE_DIAGNOSTIC_FEE
  MANUAL_REVIEW
}

enum RecommendationStatus {
  PENDING_REVIEW
  AUTO_APPROVED   // engine determined no human approval was required
  APPROVED
  REJECTED
  EDITED
}

enum AgentName {
  ORCHESTRATOR
  COST_AGENT
  PRICING_AGENT
}
```

`AgentName` intentionally only lists the three agents that are actually
implemented. Adding `MARKET_AGENT`, `DEMAND_AGENT`, etc. is a one-line,
additive enum change when those agents are built — no reason to add enum
values with no writer today.

## New models

### `RepairCategory`
The pricing unit of analysis ("PS5 motherboard repair", "iPhone board
repair"). Distinct from the existing `EquipmentCategory` enum (which
classifies the *device*) — a `RepairCategory` is a priceable service and
carries the defaults the cost engine needs.

```prisma
model RepairCategory {
  id                    String   @id @default(cuid())
  slug                  String   @unique
  name                  String
  description           String?
  riskLevel             RiskLevel @default(MEDIUM)
  defaultLaborHours     Float
  defaultDiagnosticHours Float   @default(0.5)
  defaultPartsCostCents Int      @default(0)
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  repairs               Repair[]
  recommendations       PricingRecommendation[]

  @@index([slug])
}
```

### `PricingRule`
Admin-configurable inputs to the deterministic engine (§32 of the source
spec: "No hard-coded business values"). A single active global rule today
(`key = "global"`); the `key` field lets a future per-category override
exist under the same table without a schema change.

```prisma
model PricingRule {
  id                             String   @id @default(cuid())
  key                            String   @unique @default("global")
  minimumMarginPercent           Float    @default(0.35)
  targetMarginPercent            Float    @default(0.55)
  minimumDiagnosticFeeCents      Int      @default(4900)
  minimumRepairPriceCents        Int      @default(4900)
  maximumDiscountPercent         Float    @default(0.15)
  rushMultiplier                 Float    @default(1.25)
  complexityMultiplierMax        Float    @default(1.30)
  riskMultiplierMax              Float    @default(1.20)
  premiumFactor                  Float    @default(1.15)
  maximumJustifiedMultiplier     Float    @default(1.6)
  warrantyReservePercent         Float    @default(0.04)
  overheadAllocationPercent      Float    @default(0.08)
  paymentProcessingPercent       Float    @default(0.029)
  paymentProcessingFixedCents    Int      @default(30)
  technicianHourlyCostCents      Int      @default(4500)
  capacityHighThresholdPercent   Float    @default(0.90)
  capacityLowThresholdPercent    Float    @default(0.50)
  approvalConfidenceThreshold    Float    @default(0.55)
  manualReviewOverride           Boolean  @default(false)
  updatedAt                      DateTime @updatedAt
  updatedBy                      User?    @relation(fields: [updatedById], references: [id])
  updatedById                    String?

  @@index([key])
}
```

### `PricingRecommendation`
One row per generated recommendation — the audit trail for every price the
system has ever suggested, and the training data for the future Demand
Agent (§5 of the source spec).

```prisma
model PricingRecommendation {
  id                               String   @id @default(cuid())
  repairCategory                   RepairCategory? @relation(fields: [repairCategoryId], references: [id])
  repairCategoryId                 String?
  repair                           Repair?  @relation(fields: [repairId], references: [id])
  repairId                         String?

  partsCostCents                   Int
  laborHours                       Float
  technicianHourlyCostCents        Int
  shippingCostCents                Int
  paymentCostCents                 Int
  consumablesCostCents             Int
  warrantyReserveCents             Int
  overheadCents                    Int
  estimatedTotalCostCents          Int

  priceFloorCents                  Int
  competitivePriceCents            Int?
  recommendedPriceCents            Int
  premiumPriceCents                Int
  maxJustifiedPriceCents           Int

  grossProfitCents                 Int
  grossMarginPercent               Float
  profitPerTechnicianHourCents     Int?
  estimatedAcceptanceProbability   Float
  expectedContributionProfitCents  Int
  confidence                       Float

  priceAction                      PriceAction
  reasoning                        String[]
  riskFlags                        String[]
  requiresHumanApproval            Boolean

  status                           RecommendationStatus @default(PENDING_REVIEW)
  finalPriceCents                  Int?
  reviewedBy                       User?    @relation(fields: [reviewedById], references: [id])
  reviewedById                     String?
  reviewedAt                       DateTime?
  reviewNote                       String?

  createdAt                        DateTime @default(now())

  agentRuns                        AgentRun[]

  @@index([repairCategoryId])
  @@index([repairId])
  @@index([status])
  @@index([createdAt])
}
```

### `AgentRun`
Observability for every agent/orchestrator invocation (§22).

```prisma
model AgentRun {
  id                      String    @id @default(cuid())
  agentName               AgentName
  taskDescription         String
  provider                String    // "anthropic" | "none"
  model                   String?
  inputSummary            Json
  outputSummary           Json
  confidence              Float?
  latencyMs               Int
  tokenEstimate           Int?
  costEstimateCents       Int?
  succeeded               Boolean
  errorMessage            String?
  createdAt               DateTime  @default(now())

  pricingRecommendation   PricingRecommendation? @relation(fields: [pricingRecommendationId], references: [id])
  pricingRecommendationId String?

  @@index([agentName])
  @@index([pricingRecommendationId])
  @@index([createdAt])
}
```

### `SystemSetting`
Generic admin-configurable key/value store for platform settings that
aren't part of `PricingRule` (AI budget caps, approval thresholds not tied
to pricing, etc.) — reserved now, first real reader/writer arrives with the
admin settings UI expansion in a later phase.

```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   User?    @relation(fields: [updatedById], references: [id])
  updatedById String?
}
```

## Changes to existing models

- `Repair` gains two **optional** fields so existing rows and the existing
  intake flow are unaffected:
  ```prisma
  repairCategory           RepairCategory? @relation(fields: [repairCategoryId], references: [id])
  repairCategoryId         String?
  estimatedTechnicianHours Float?
  pricingRecommendations   PricingRecommendation[]
  ```
- `Technician` gains cost/capacity fields needed for profit-per-hour math:
  ```prisma
  hourlyCostCents       Int?
  capacityHoursPerWeek  Float?
  ```
- `User` gains the inverse relations for `PricingRule.updatedBy`,
  `PricingRecommendation.reviewedBy`, `SystemSetting.updatedBy`.

## Reserved for future phases (not created yet)

Per `AGENT_SPECIFICATIONS.md`, these models are named here so a future
migration slots in without renaming anything a dashboard might already
reference: `MarketPrice`, `MarketSource` (Market Intelligence Agent),
`DemandObservation` (Demand/Elasticity Agent), `CapacitySnapshot`,
`TechnicianTimeEntry` (Capacity Agent), `MarketingCampaign`,
`MarketingSpend`, `MarketingAttribution` (Marketing ROI Agent), `Lead`,
`LeadSource` (B2B Prospecting), `KnowledgeDocument`, `KnowledgeChunk`,
`Embedding` (RAG / Technician Copilot), `Forecast`, `Alert` (Forecasting /
Anomaly Agents).

## Indexes

Every new foreign key and every field used as a dashboard filter
(`status`, `agentName`, `createdAt`, `repairCategoryId`) is indexed per the
source spec's explicit index list (§9). `RepairCategory.slug` and
`PricingRule.key` carry unique indexes since they're the lookup keys used by
the pricing API.

## Migration

Generated via `npx prisma migrate dev --name add_pricing_engine` against a
local PostgreSQL instance in this environment; the resulting SQL file lives
in `prisma/migrations/` alongside the existing `init` migration and is
committed to the repository (Prisma migrations are meant to be applied with
`prisma migrate deploy` in production, never re-generated on the fly).
