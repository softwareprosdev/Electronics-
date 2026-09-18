import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example-electronics-lab.com'
  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH || (await bcrypt.hash('ChangeMe123!', 12))

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Lab Administrator',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
    },
  })

  const categories = [
    { slug: 'phones-tablets', name: 'Phones & Tablets', sortOrder: 1 },
    { slug: 'computers', name: 'Computers & Motherboards', sortOrder: 2 },
    { slug: 'gaming', name: 'Gaming Consoles', sortOrder: 3 },
    { slug: 'automotive', name: 'Automotive Electronics', sortOrder: 4 },
    { slug: 'aviation', name: 'Aviation Electronics', sortOrder: 5 },
    { slug: 'mining', name: 'ASIC & Mining Hardware', sortOrder: 6 },
    { slug: 'industrial', name: 'Industrial & Specialty', sortOrder: 7 },
  ]

  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: category,
    })
  }

  const locations = [
    {
      slug: 'harlingen',
      city: 'Harlingen',
      zipCodes: ['78550', '78551', '78552', '78553'],
      headline: 'Advanced Electronics Repair in Harlingen, TX',
      summary:
        'Our laboratory is based in the Harlingen area, serving the core of the Rio Grande Valley with board-level diagnostics and component-level repair.',
    },
    {
      slug: 'brownsville',
      city: 'Brownsville',
      zipCodes: ['78520', '78521', '78526'],
      headline: 'Board-Level Electronics Repair Serving Brownsville',
      summary:
        'Customers throughout Brownsville send devices, boards, and modules to our laboratory for component-level diagnostics via local drop-off coordination or mail-in service.',
    },
    {
      slug: 'weslaco',
      city: 'Weslaco',
      zipCodes: ['78596', '78599'],
      headline: 'Electronics Repair Laboratory Serving Weslaco',
      summary:
        'Weslaco customers have access to the same advanced diagnostic and component-level repair capability used throughout the Rio Grande Valley.',
    },
    {
      slug: 'mcallen',
      city: 'McAllen',
      zipCodes: ['78501', '78503', '78504'],
      headline: 'Advanced Electronics Repair Serving McAllen',
      summary:
        'McAllen customers, repair shops, and businesses can route board-level electronics work to our laboratory for component-level evaluation.',
    },
    {
      slug: 'mission',
      city: 'Mission',
      zipCodes: ['78572', '78573', '78574'],
      headline: 'Electronics Repair Laboratory Serving Mission, TX',
      summary:
        'Mission marks the western edge of our primary Rio Grande Valley service corridor, running from Harlingen to Mission for board-level and component-level repair.',
    },
    {
      slug: 'edinburg',
      city: 'Edinburg',
      zipCodes: ['78539', '78541', '78542'],
      headline: 'Board-Level Repair Serving Edinburg, TX',
      summary:
        'Edinburg customers and repair businesses can submit devices, boards, and modules to our laboratory for advanced diagnostics and repair.',
    },
  ]

  for (const location of locations) {
    await prisma.location.upsert({
      where: { slug: location.slug },
      update: location,
      create: location,
    })
  }

  await prisma.pricingRule.upsert({
    where: { key: 'global' },
    update: {},
    create: { key: 'global' },
  })

  // Repair categories for the pricing engine — the priceable unit of work,
  // distinct from the marketing ServiceCategory rows above. Labor-hour and
  // risk defaults are starting points; refine them from real repair history
  // once it exists (see /docs/IMPLEMENTATION_PLAN.md).
  const repairCategories = [
    {
      slug: 'iphone-ipad-board-repair',
      name: 'iPhone / iPad Board Repair',
      riskLevel: 'MEDIUM' as const,
      defaultLaborHours: 1.5,
      defaultDiagnosticHours: 0.5,
      defaultPartsCostCents: 3500,
    },
    {
      slug: 'computer-motherboard-repair',
      name: 'Computer Motherboard Repair',
      riskLevel: 'MEDIUM' as const,
      defaultLaborHours: 2,
      defaultDiagnosticHours: 0.75,
      defaultPartsCostCents: 4500,
    },
    {
      slug: 'gpu-repair',
      name: 'GPU Repair',
      riskLevel: 'MEDIUM' as const,
      defaultLaborHours: 2.5,
      defaultDiagnosticHours: 0.75,
      defaultPartsCostCents: 6000,
    },
    {
      slug: 'ps5-motherboard-repair',
      name: 'PS5 Motherboard Repair',
      riskLevel: 'MEDIUM' as const,
      defaultLaborHours: 2,
      defaultDiagnosticHours: 0.5,
      defaultPartsCostCents: 4000,
    },
    {
      slug: 'xbox-motherboard-repair',
      name: 'Xbox Motherboard Repair',
      riskLevel: 'MEDIUM' as const,
      defaultLaborHours: 2,
      defaultDiagnosticHours: 0.5,
      defaultPartsCostCents: 4000,
    },
    {
      slug: 'nintendo-switch-repair',
      name: 'Nintendo Switch Board Repair',
      riskLevel: 'LOW' as const,
      defaultLaborHours: 1.5,
      defaultDiagnosticHours: 0.5,
      defaultPartsCostCents: 2500,
    },
    {
      slug: 'automotive-ecm-bcm-tcm-repair',
      name: 'Automotive ECM / BCM / TCM Repair',
      riskLevel: 'HIGH' as const,
      defaultLaborHours: 3,
      defaultDiagnosticHours: 1.5,
      defaultPartsCostCents: 8000,
    },
    {
      slug: 'asic-mining-board-repair',
      name: 'ASIC / Mining Hashboard Repair',
      riskLevel: 'MEDIUM' as const,
      defaultLaborHours: 2,
      defaultDiagnosticHours: 0.5,
      defaultPartsCostCents: 5000,
    },
    {
      slug: 'aviation-electronics-repair',
      name: 'Aviation Electronics Repair',
      riskLevel: 'HIGH' as const,
      defaultLaborHours: 4,
      defaultDiagnosticHours: 2,
      defaultPartsCostCents: 12000,
    },
    {
      slug: 'tv-board-repair',
      name: 'TV Board Repair',
      riskLevel: 'LOW' as const,
      defaultLaborHours: 1,
      defaultDiagnosticHours: 0.5,
      defaultPartsCostCents: 2000,
    },
  ]

  for (const category of repairCategories) {
    await prisma.repairCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        riskLevel: category.riskLevel,
        defaultLaborHours: category.defaultLaborHours,
        defaultDiagnosticHours: category.defaultDiagnosticHours,
        defaultPartsCostCents: category.defaultPartsCostCents,
      },
      create: category,
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
