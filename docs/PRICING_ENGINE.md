# Pricing & Cost Engine

Location: `src/lib/pricing/`. Pure TypeScript, no database access, no
network calls, no LLM calls — every function here is a deterministic
transform of numbers you pass in, which is what makes it exhaustively unit
testable (`src/lib/pricing/*.test.ts`, colocated with the code they cover).

## Cost engine (`cost-engine.ts`)

`computeCostBreakdown(inputs: CostInputs, rule: PricingRuleConfig): CostBreakdown`

```
partsCostCents          input, as-is
laborCostCents          laborHours * technicianHourlyCostCents
diagnosticCostCents      diagnosticHours * technicianHourlyCostCents
shippingCostCents       input, as-is
paymentCostCents        round(salePriceCents * paymentProcessingPercent) + paymentProcessingFixedCents
                         (computed later, against the price being evaluated —
                         see pricing-engine; cost-engine exposes a helper
                         that takes an explicit price for this)
consumablesCostCents    input, as-is
warrantyReserveCents    round(baseCostCents * warrantyReservePercent)
overheadCents           round(baseCostCents * overheadAllocationPercent)

variableCostCents = partsCostCents + laborCostCents + diagnosticCostCents
                   + shippingCostCents + consumablesCostCents
                   + warrantyReserveCents

trueCostCents = variableCostCents + overheadCents + paymentCostCents(at price)
```

`payment cost` is a function of the sale price (percentage-based processor
fees), so it is computed for a *specific* candidate price rather than baked
into a single fixed "cost" number — `pricing-engine.ts` calls
`computeCostBreakdown` once per candidate price point (floor, competitive,
recommended, premium) so every price's margin reflects its own true
processing cost.

## Pricing engine (`pricing-engine.ts`)

`recommendPrice(input: PricingRequest): PriceRecommendation`

1. **Floor price** — the lowest price at which `minimumMarginPercent` is
   still met against the variable cost (payment fee solved algebraically
   since it is itself a percentage of price):

   ```
   floorPriceCents = ceil(
     (variableCostBeforePayment + paymentProcessingFixedCents)
     / (1 - minimumMarginPercent - paymentProcessingPercent)
   )
   ```

2. **Target/Recommended price** — same formula using `targetMarginPercent`,
   then adjusted by legitimate, configurable multipliers (§18 of the source
   spec explicitly allows these — never protected-class or personal
   attributes):
   - `rushMultiplier` if `isRush`
   - `complexityMultiplier` scaled by `complexityScore` (0–1)
   - `riskMultiplier` scaled by `riskScore` (0–1)
   - a **capacity adjustment**: if `technicianCapacityPercent > 90`, the
     recommended price is pushed toward the premium price for
     `isLowPriority` work (protects scarce bench time); if capacity is
     underutilized (`< 50%`) the engine allows the recommended price to
     drift down toward — but never below — the floor.
   The recommended price is always clamped to be `>= floorPriceCents`.

3. **Premium price** — recommended price × a premium factor (default 1.15,
   configurable), representing the top of a justifiable range for
   high-difficulty/low-availability work.

4. **Maximum justified price** — premium price further bounded by
   `maximumJustifiedMultiplier` off the floor, so the ceiling itself is
   never unbounded/arbitrary.

5. **Competitive price** — **only** populated when real `MarketPriceInput[]`
   observations are passed in (median of supplied observations). The engine
   never fabricates a market price. With no observations, `competitivePriceCents`
   is `null` and `confidence` factors in "no market data" — this is the
   direct implementation of the spec's AI-safety rule "never fabricate
   competitor prices."

6. **Acceptance probability / expected contribution profit** — if
   `historicalAcceptance` (a `{accepted, quoted}` count pair) is supplied,
   the engine uses the empirical acceptance rate at that price bucket and
   reports a confidence score that grows with sample size. Without
   historical data it falls back to a labeled heuristic (`estimationMethod:
   "heuristic_no_history"`) — a smooth, distance-from-floor based curve —
   and confidence is capped low. The engine never claims statistical
   significance it doesn't have.

   ```
   expectedContributionProfitCents =
     (recommendedPriceCents - variableCostCents) * acceptanceProbability
   ```

7. **Price action** — one of `INCREASE | DECREASE | MAINTAIN |
   REQUIRE_DIAGNOSTIC_FEE | MANUAL_REVIEW`, derived from: margin vs.
   minimum, risk score, capacity, and (when supplied) demand/acceptance
   trend. See `determinePriceAction()`.

8. **`requiresHumanApproval`** is `true` when any of:
   - `recommendedPriceCents < floorPriceCents` (should not happen given the
     clamp, but re-checked defensively)
   - `grossMarginPercent < rule.minimumMarginPercent`
   - `riskFlags` includes `HIGH_RISK` or `BELOW_FLOOR`
   - `confidence < rule.approvalConfidenceThreshold`
   - the rule's `manualReviewOverride` is set (admin can force review on a
     whole category)

## Output shape

`recommendPrice()` returns exactly the object shape specified in the source
task (camelCase, cents-based money fields to avoid floating point error):

```ts
interface PriceRecommendation {
  repairCategory: string
  recommendedPriceCents: number
  priceFloorCents: number
  competitivePriceCents: number | null
  premiumPriceCents: number
  maxJustifiedPriceCents: number
  partsCostCents: number
  laborCostCents: number
  estimatedTotalCostCents: number
  grossProfitCents: number
  grossMarginPercent: number
  profitPerTechnicianHourCents: number | null
  estimatedAcceptanceProbability: number
  expectedContributionProfitCents: number
  confidence: number
  priceAction: PriceAction
  reasoning: string[]
  riskFlags: string[]
  requiresHumanApproval: boolean
}
```

`reasoning` is generated by the deterministic engine itself (plain strings
describing which rules fired) — the AI layer (`pricing-agent.ts`) may
*rewrite these into a nicer narrative* when an AI provider is configured,
but the underlying facts and numbers are never touched by the LLM.

## Configurable rules

All the constants above live in the `PricingRule` Prisma model and are
editable at `/admin/pricing/rules` (ADMIN/OWNER/SUPER_ADMIN only) — nothing
is hard-coded. See `DATABASE_ARCHITECTURE.md`.

## Worked example (also a unit test)

```
parts        = $50.00  (5000c)
labor        = 1 hour @ $100/hr (10000c)
shipping     = $20.00 (2000c)
payment fee  = 2.9% + $0.30
minimum margin = 60%

variableCostBeforePayment = 5000 + 10000 + 2000 = 17000c ($170)
floor = ceil((17000 + 30) / (1 - 0.60 - 0.029)) = ceil(17030 / 0.371)
      ≈ 45903c → $459.03
```

`src/lib/pricing/cost-engine.test.ts` and
`src/lib/pricing/pricing-engine.test.ts` assert this and many edge cases (zero labor hours,
negative margin guard, below-floor detection, capacity adjustment, rush/risk
multipliers, missing market data, missing historical data).
