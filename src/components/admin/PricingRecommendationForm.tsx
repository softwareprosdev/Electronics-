'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface RepairCategoryOption {
  id: string
  slug: string
  name: string
  riskLevel: string
  defaultLaborHours: number
  defaultDiagnosticHours: number
  defaultPartsCostCents: number
}

interface RecommendationResponse {
  recommendationId: string
  recommendation: {
    repairCategory: string
    recommendedPriceCents: number
    priceFloorCents: number
    competitivePriceCents: number | null
    premiumPriceCents: number
    maxJustifiedPriceCents: number
    grossProfitCents: number
    grossMarginPercent: number
    profitPerTechnicianHourCents: number | null
    estimatedAcceptanceProbability: number
    expectedContributionProfitCents: number
    confidence: number
    priceAction: string
    reasoning: string[]
    riskFlags: string[]
    requiresHumanApproval: boolean
  }
  aiNarrative: string | null
  aiRiskFlags: string[]
}

function formatCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '—'
  return `$${(cents / 100).toFixed(2)}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function PricingRecommendationForm({ categories }: { categories: RepairCategoryOption[] }) {
  const router = useRouter()
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? '')
  const selectedCategory = categories.find((c) => c.slug === categorySlug)

  const [partsCost, setPartsCost] = useState('50.00')
  const [laborHours, setLaborHours] = useState(String(selectedCategory?.defaultLaborHours ?? 1))
  const [diagnosticHours, setDiagnosticHours] = useState(
    String(selectedCategory?.defaultDiagnosticHours ?? 0.5),
  )
  const [shippingCost, setShippingCost] = useState('0.00')
  const [riskLevel, setRiskLevel] = useState(selectedCategory?.riskLevel ?? 'MEDIUM')
  const [isRush, setIsRush] = useState(false)
  const [isLowPriority, setIsLowPriority] = useState(false)
  const [complexityScore, setComplexityScore] = useState('0')
  const [technicianCapacityPercent, setTechnicianCapacityPercent] = useState('')
  const [symptomText, setSymptomText] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showWhy, setShowWhy] = useState(false)
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  function onCategoryChange(slug: string) {
    setCategorySlug(slug)
    const category = categories.find((c) => c.slug === slug)
    if (category) {
      setLaborHours(String(category.defaultLaborHours))
      setDiagnosticHours(String(category.defaultDiagnosticHours))
      setRiskLevel(category.riskLevel)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setShowWhy(false)

    try {
      const response = await fetch('/api/pricing/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairCategorySlug: categorySlug || undefined,
          repairCategoryLabel: categorySlug ? undefined : 'Custom repair',
          costInputs: {
            partsCostCents: Math.round(Number.parseFloat(partsCost || '0') * 100),
            laborHours: Number.parseFloat(laborHours || '0'),
            diagnosticHours: Number.parseFloat(diagnosticHours || '0'),
            shippingCostCents: Math.round(Number.parseFloat(shippingCost || '0') * 100),
          },
          riskLevel,
          isRush,
          isLowPriority,
          complexityScore: Number.parseFloat(complexityScore || '0'),
          technicianCapacityPercent: technicianCapacityPercent
            ? Number.parseFloat(technicianCapacityPercent)
            : undefined,
          symptomText: symptomText || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate a pricing recommendation.')
      }
      setResult(data)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate a pricing recommendation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
        Get a Price Recommendation
      </h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Repair Category
          </label>
          <select
            value={categorySlug}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Parts Cost ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={partsCost}
            onChange={(e) => setPartsCost(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Labor Hours
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={laborHours}
            onChange={(e) => setLaborHours(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Diagnostic Hours
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            value={diagnosticHours}
            onChange={(e) => setDiagnosticHours(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Shipping Cost ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Risk Level
          </label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Complexity (0&ndash;1)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={complexityScore}
            onChange={(e) => setComplexityScore(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Technician Capacity (%)
          </label>
          <input
            type="number"
            step="1"
            min="0"
            max="200"
            placeholder="optional"
            value={technicianCapacityPercent}
            onChange={(e) => setTechnicianCapacityPercent(e.target.value)}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-lab-text">
            <input type="checkbox" checked={isRush} onChange={(e) => setIsRush(e.target.checked)} />
            Rush
          </label>
          <label className="flex items-center gap-2 text-sm text-lab-text">
            <input
              type="checkbox"
              checked={isLowPriority}
              onChange={(e) => setIsLowPriority(e.target.checked)}
            />
            Low priority
          </label>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Symptom Text (optional, classified by AI into risk flags)
          </label>
          <textarea
            value={symptomText}
            onChange={(e) => setSymptomText(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        {error && <p className="sm:col-span-2 lg:col-span-3 text-sm text-lab-danger">{error}</p>}

        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'Computing…' : 'Get Recommendation'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-8 border-t border-lab-line pt-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="panel p-4">
              <p className="text-xs uppercase tracking-wide text-lab-muted">Floor</p>
              <p className="mt-1 text-lg font-bold text-lab-text">
                {formatCents(result.recommendation.priceFloorCents)}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-xs uppercase tracking-wide text-lab-muted">Competitive</p>
              <p className="mt-1 text-lg font-bold text-lab-text">
                {result.recommendation.competitivePriceCents === null
                  ? 'No market data'
                  : formatCents(result.recommendation.competitivePriceCents)}
              </p>
            </div>
            <div className="panel border-lab-accent/60 p-4">
              <p className="text-xs uppercase tracking-wide text-lab-muted">Recommended</p>
              <p className="mt-1 text-lg font-bold text-lab-accent2">
                {formatCents(result.recommendation.recommendedPriceCents)}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-xs uppercase tracking-wide text-lab-muted">Premium</p>
              <p className="mt-1 text-lg font-bold text-lab-text">
                {formatCents(result.recommendation.premiumPriceCents)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4 text-sm">
            <p className="text-lab-muted">
              Margin: <span className="text-lab-text">{formatPercent(result.recommendation.grossMarginPercent)}</span>
            </p>
            <p className="text-lab-muted">
              Profit/hr:{' '}
              <span className="text-lab-text">
                {formatCents(result.recommendation.profitPerTechnicianHourCents)}
              </span>
            </p>
            <p className="text-lab-muted">
              Acceptance:{' '}
              <span className="text-lab-text">
                {formatPercent(result.recommendation.estimatedAcceptanceProbability)}
              </span>
            </p>
            <p className="text-lab-muted">
              Confidence: <span className="text-lab-text">{formatPercent(result.recommendation.confidence)}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-lab-line px-2 py-1 text-xs uppercase tracking-wide text-lab-text">
              {result.recommendation.priceAction.replace(/_/g, ' ')}
            </span>
            {result.recommendation.requiresHumanApproval && (
              <span className="rounded-sm border border-lab-warn px-2 py-1 text-xs uppercase tracking-wide text-lab-warn">
                Requires human approval
              </span>
            )}
            {[...result.recommendation.riskFlags, ...result.aiRiskFlags].map((flag) => (
              <span key={flag} className="rounded-sm border border-lab-line px-2 py-1 text-xs text-lab-muted">
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            className="btn-tertiary mt-4 text-xs"
          >
            {showWhy ? 'Hide Why?' : 'Why?'}
          </button>

          {showWhy && (
            <div className="mt-3 space-y-2 rounded-sm border border-lab-line bg-lab-panel2 p-4 text-sm text-lab-muted">
              {result.aiNarrative && (
                <p className="text-lab-text">
                  <span className="font-semibold">Summary: </span>
                  {result.aiNarrative}
                </p>
              )}
              <ul className="list-disc space-y-1 pl-5">
                {result.recommendation.reasoning.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
