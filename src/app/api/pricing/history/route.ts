import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PRICING_VIEW_ROLES, requireRole } from '@/lib/rbac'
import type { RecommendationStatus } from '@prisma/client'

const VALID_STATUSES: RecommendationStatus[] = [
  'PENDING_REVIEW',
  'AUTO_APPROVED',
  'APPROVED',
  'REJECTED',
  'EDITED',
]

export async function GET(request: Request) {
  const auth = await requireRole(PRICING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category') ?? undefined
  const statusParam = searchParams.get('status') ?? undefined
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '25', 10)
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 25

  if (statusParam && !VALID_STATUSES.includes(statusParam as RecommendationStatus)) {
    return NextResponse.json({ error: 'Invalid status filter.' }, { status: 400 })
  }
  const status = statusParam as RecommendationStatus | undefined

  const recommendations = await prisma.pricingRecommendation.findMany({
    where: {
      repairCategory: categorySlug ? { slug: categorySlug } : undefined,
      status,
    },
    include: {
      repairCategory: { select: { slug: true, name: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ recommendations }, { headers: { 'Cache-Control': 'no-store' } })
}
