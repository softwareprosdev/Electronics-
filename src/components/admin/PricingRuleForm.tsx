'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export interface PricingRuleValues {
  minimumMarginPercent: number
  targetMarginPercent: number
  minimumDiagnosticFeeCents: number
  minimumRepairPriceCents: number
  maximumDiscountPercent: number
  rushMultiplier: number
  complexityMultiplierMax: number
  riskMultiplierMax: number
  premiumFactor: number
  maximumJustifiedMultiplier: number
  warrantyReservePercent: number
  overheadAllocationPercent: number
  paymentProcessingPercent: number
  paymentProcessingFixedCents: number
  technicianHourlyCostCents: number
  capacityHighThresholdPercent: number
  capacityLowThresholdPercent: number
  approvalConfidenceThreshold: number
  manualReviewOverride: boolean
}

const FIELDS: Array<{
  key: keyof PricingRuleValues
  label: string
  kind: 'percent' | 'cents' | 'multiplier' | 'boolean'
}> = [
  { key: 'minimumMarginPercent', label: 'Minimum margin', kind: 'percent' },
  { key: 'targetMarginPercent', label: 'Target margin', kind: 'percent' },
  { key: 'minimumDiagnosticFeeCents', label: 'Minimum diagnostic fee', kind: 'cents' },
  { key: 'minimumRepairPriceCents', label: 'Minimum repair price', kind: 'cents' },
  { key: 'maximumDiscountPercent', label: 'Maximum discount', kind: 'percent' },
  { key: 'rushMultiplier', label: 'Rush multiplier', kind: 'multiplier' },
  { key: 'complexityMultiplierMax', label: 'Max complexity multiplier', kind: 'multiplier' },
  { key: 'riskMultiplierMax', label: 'Max risk multiplier', kind: 'multiplier' },
  { key: 'premiumFactor', label: 'Premium factor', kind: 'multiplier' },
  { key: 'maximumJustifiedMultiplier', label: 'Max justified multiplier (of floor)', kind: 'multiplier' },
  { key: 'warrantyReservePercent', label: 'Warranty reserve', kind: 'percent' },
  { key: 'overheadAllocationPercent', label: 'Overhead allocation', kind: 'percent' },
  { key: 'paymentProcessingPercent', label: 'Payment processing %', kind: 'percent' },
  { key: 'paymentProcessingFixedCents', label: 'Payment processing fixed fee', kind: 'cents' },
  { key: 'technicianHourlyCostCents', label: 'Default technician hourly cost', kind: 'cents' },
  { key: 'capacityHighThresholdPercent', label: 'Capacity-constrained threshold', kind: 'percent' },
  { key: 'capacityLowThresholdPercent', label: 'Capacity-underutilized threshold', kind: 'percent' },
  { key: 'approvalConfidenceThreshold', label: 'Minimum confidence before approval required', kind: 'percent' },
]

function toInputValue(value: number, kind: string): string {
  if (kind === 'percent') return (value * 100).toString()
  if (kind === 'cents') return (value / 100).toFixed(2)
  return value.toString()
}

function fromInputValue(raw: string, kind: string): number {
  const parsed = Number.parseFloat(raw || '0')
  if (kind === 'percent') return parsed / 100
  if (kind === 'cents') return Math.round(parsed * 100)
  return parsed
}

export function PricingRuleForm({ rule, readOnly }: { rule: PricingRuleValues; readOnly: boolean }) {
  const router = useRouter()
  const [values, setValues] = useState(rule)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function setField(key: keyof PricingRuleValues, raw: string, kind: string) {
    setValues((prev) => ({ ...prev, [key]: fromInputValue(raw, kind) }))
    setSaved(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch('/api/admin/pricing-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save pricing rules.')
      }
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pricing rules.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-6">
      <fieldset disabled={readOnly} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              {field.label}
              {field.kind === 'percent' && ' (%)'}
              {field.kind === 'cents' && ' ($)'}
            </label>
            <input
              type="number"
              step={field.kind === 'multiplier' ? '0.01' : field.kind === 'percent' ? '0.1' : '0.01'}
              value={toInputValue(values[field.key] as number, field.kind)}
              onChange={(e) => setField(field.key, e.target.value, field.kind)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent disabled:opacity-60"
            />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm text-lab-text">
          <input
            type="checkbox"
            checked={values.manualReviewOverride}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, manualReviewOverride: e.target.checked }))
              setSaved(false)
            }}
          />
          Force manual review on every recommendation
        </label>
      </fieldset>

      {error && <p className="mt-4 text-sm text-lab-danger">{error}</p>}
      {saved && <p className="mt-4 text-sm text-lab-accent2">Pricing rules saved.</p>}

      {!readOnly && (
        <button type="submit" disabled={saving} className="btn-primary mt-6 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Pricing Rules'}
        </button>
      )}
      {readOnly && (
        <p className="mt-6 text-xs text-lab-muted">
          Your role can view but not edit pricing rules.
        </p>
      )}
    </form>
  )
}
