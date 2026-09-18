import { describe, expect, it } from 'vitest'
import { evaluateCampaignHealth, evaluateFunnelHealth } from './guardrails'

describe('evaluateCampaignHealth', () => {
  it('watches a channel with no spend yet', () => {
    const result = evaluateCampaignHealth({
      channel: 'GOOGLE_SEARCH',
      spendCents: 0,
      leads: 0,
      targetCplCents: 3000,
      consecutiveBadPeriods: 0,
    })
    expect(result.action).toBe('WATCH')
    expect(result.actualCplCents).toBeNull()
  })

  it('watches a channel performing at or under target CPL', () => {
    const result = evaluateCampaignHealth({
      channel: 'GOOGLE_SEARCH',
      spendCents: 9000,
      leads: 3,
      targetCplCents: 3000,
      consecutiveBadPeriods: 0,
    })
    expect(result.action).toBe('WATCH')
    expect(result.actualCplCents).toBe(3000)
  })

  it('flags a channel moderately over target but within tolerance', () => {
    const result = evaluateCampaignHealth({
      channel: 'META',
      spendCents: 12000,
      leads: 3, // CPL 4000, target 3000 -> 1.33x, under 1.5x tolerance
      targetCplCents: 3000,
      consecutiveBadPeriods: 0,
    })
    expect(result.action).toBe('FLAG_FOR_REVIEW')
    expect(result.actualCplCents).toBe(4000)
  })

  it('recommends reallocation the first time a channel exceeds 1.5x target', () => {
    const result = evaluateCampaignHealth({
      channel: 'META',
      spendCents: 15000,
      leads: 2, // CPL 7500, target 3000 -> 2.5x
      targetCplCents: 3000,
      consecutiveBadPeriods: 1,
    })
    expect(result.action).toBe('AUTO_REALLOCATE')
    expect(result.actualCplCents).toBe(7500)
  })

  it('recommends auto-pause after 3+ consecutive bad periods', () => {
    const result = evaluateCampaignHealth({
      channel: 'META',
      spendCents: 15000,
      leads: 2,
      targetCplCents: 3000,
      consecutiveBadPeriods: 3,
    })
    expect(result.action).toBe('AUTO_PAUSE')
  })

  it('treats spend with zero leads as a review-worthy signal, escalating to pause', () => {
    const early = evaluateCampaignHealth({
      channel: 'TIKTOK',
      spendCents: 5000,
      leads: 0,
      targetCplCents: 3000,
      consecutiveBadPeriods: 1,
    })
    expect(early.action).toBe('FLAG_FOR_REVIEW')

    const late = evaluateCampaignHealth({
      channel: 'TIKTOK',
      spendCents: 5000,
      leads: 0,
      targetCplCents: 3000,
      consecutiveBadPeriods: 3,
    })
    expect(late.action).toBe('AUTO_PAUSE')
  })
})

describe('evaluateFunnelHealth', () => {
  it('is OK for a fast 200 with expected content found', () => {
    const result = evaluateFunnelHealth({
      target: 'homepage',
      httpStatus: 200,
      latencyMs: 400,
      expectedContentFound: true,
      errorDetail: null,
    })
    expect(result.status).toBe('OK')
  })

  it('is DOWN on a network error regardless of status', () => {
    const result = evaluateFunnelHealth({
      target: 'contact-api',
      httpStatus: null,
      latencyMs: null,
      expectedContentFound: null,
      errorDetail: 'fetch failed: ECONNREFUSED',
    })
    expect(result.status).toBe('DOWN')
  })

  it('is DOWN on a 5xx response', () => {
    const result = evaluateFunnelHealth({
      target: 'repair-request-form',
      httpStatus: 502,
      latencyMs: 300,
      expectedContentFound: null,
      errorDetail: null,
    })
    expect(result.status).toBe('DOWN')
  })

  it('is DEGRADED on a 4xx response', () => {
    const result = evaluateFunnelHealth({
      target: 'sitemap',
      httpStatus: 404,
      latencyMs: 300,
      expectedContentFound: null,
      errorDetail: null,
    })
    expect(result.status).toBe('DEGRADED')
  })

  it('is DEGRADED when expected content is missing on an otherwise-200 page', () => {
    const result = evaluateFunnelHealth({
      target: 'homepage',
      httpStatus: 200,
      latencyMs: 400,
      expectedContentFound: false,
      errorDetail: null,
    })
    expect(result.status).toBe('DEGRADED')
  })

  it('is DEGRADED when response is slow', () => {
    const result = evaluateFunnelHealth({
      target: 'homepage',
      httpStatus: 200,
      latencyMs: 6000,
      expectedContentFound: true,
      errorDetail: null,
    })
    expect(result.status).toBe('DEGRADED')
  })
})
