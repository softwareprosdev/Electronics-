import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example-electronics-lab.com'
  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH || (await hashPassword('ChangeMe123!'))

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
      headline: 'Board-Level Electronics Repair in Harlingen, TX',
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
      headline: 'Board-Level Electronics Repair Serving McAllen',
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

  const storeProducts = [
    {
      sku: 'CAP-TANT-100',
      slug: 'smd-tantalum-capacitor-assortment-kit',
      publicName: 'SMD Tantalum Capacitor Assortment Kit (100pc)',
      description: 'SMD tantalum capacitor assortment, 100 pieces, common laptop/motherboard values',
      publicDescription:
        'The most common tantalum capacitor values used on laptop motherboards and power rails, in one kit. 100 pieces across the values we reach for most often on the bench.',
      category: 'Passive Components',
      costCents: 650,
      sellingPriceCents: 1499,
      quantityOnHand: 50,
      minimumQuantity: 10,
    },
    {
      sku: 'CAP-CER-1800',
      slug: 'smd-ceramic-capacitor-assortment-kit',
      publicName: 'SMD Ceramic Capacitor Assortment Kit (0402/0603/0805, 1800pc)',
      description: 'SMD ceramic capacitor assortment kit, 0402/0603/0805 packages, 1800 pieces',
      publicDescription:
        'A full-range ceramic capacitor kit covering 0402, 0603, and 0805 packages — the three sizes you need for phone, laptop, and GPU board work.',
      category: 'Passive Components',
      costCents: 550,
      sellingPriceCents: 1299,
      quantityOnHand: 50,
      minimumQuantity: 10,
    },
    {
      sku: 'FPC-BATT-UNI',
      slug: 'battery-connector-flex-cable-universal',
      publicName: 'Battery Connector FPC Flex Cable (Universal)',
      description: 'Universal battery connector flex cable for common phone board repairs',
      publicDescription:
        'A replacement flex cable for a damaged or corroded battery connector — one of the most common failure points we see on phone boards.',
      category: 'Flex Cables',
      costCents: 250,
      sellingPriceCents: 699,
      quantityOnHand: 100,
      minimumQuantity: 20,
    },
    {
      sku: 'USBC-PORT-UNI',
      slug: 'usb-c-charging-port-flex-cable',
      publicName: 'USB-C Charging Port Flex Cable (Universal)',
      description: 'Universal USB-C charging port replacement flex cable for laptops and phones',
      publicDescription:
        'Replacement USB-C charging port flex cable for laptops and phones with a worn, loose, or non-charging port.',
      category: 'Flex Cables',
      costCents: 300,
      sellingPriceCents: 899,
      quantityOnHand: 80,
      minimumQuantity: 15,
    },
    {
      sku: 'MOSFET-KIT-20',
      slug: 'laptop-power-mosfet-replacement-kit',
      publicName: 'Laptop Power MOSFET Replacement Kit (20pc)',
      description: 'Laptop power-rail MOSFET replacement kit, common failure parts, 20 pieces',
      publicDescription:
        'The MOSFETs we replace most often on laptop power rails — a dead-no-power board is frequently one failed MOSFET. 20-piece kit.',
      category: 'Power Components',
      costCents: 400,
      sellingPriceCents: 999,
      quantityOnHand: 60,
      minimumQuantity: 15,
    },
    {
      sku: 'HDMI-PS5-01',
      slug: 'ps5-hdmi-port-replacement-module',
      publicName: 'PS5 HDMI Port Replacement Module',
      description: 'Replacement HDMI port module for PlayStation 5, no-signal repairs',
      publicDescription:
        'A direct-fit HDMI port replacement for PS5 consoles with a damaged port or no-signal fault.',
      category: 'Repair Kits',
      costCents: 500,
      sellingPriceCents: 1199,
      quantityOnHand: 40,
      minimumQuantity: 10,
    },
    {
      sku: 'DCJACK-UNI',
      slug: 'universal-laptop-dc-power-jack',
      publicName: 'Universal Laptop DC Power Jack (Barrel + USB-C)',
      description: 'Universal laptop DC power jack replacement, barrel and USB-C styles',
      publicDescription:
        'A universal-fit DC power jack for laptops with a loose, broken, or intermittent charging connector.',
      category: 'Power Components',
      costCents: 250,
      sellingPriceCents: 599,
      quantityOnHand: 70,
      minimumQuantity: 15,
    },
    {
      sku: 'BGA-BALL-03MM',
      slug: 'bga-reballing-solder-balls-0-3mm',
      publicName: 'BGA Reballing Solder Balls Sn63/Pb37 (0.3mm)',
      description: 'BGA reballing solder balls, Sn63/Pb37, 0.3mm diameter, ~250,000 balls',
      publicDescription:
        'Leaded Sn63/Pb37 solder balls at 0.3mm for BGA reballing work — GPU, chipset, and memory packages.',
      category: 'Repair Kits',
      costCents: 700,
      sellingPriceCents: 1699,
      quantityOnHand: 30,
      minimumQuantity: 5,
    },
    {
      sku: 'JOYCON-CHG-KIT',
      slug: 'switch-joy-con-charging-contact-repair-kit',
      publicName: 'Switch Joy-Con Charging Contact Repair Kit',
      description: 'Nintendo Switch Joy-Con charging contact replacement repair kit',
      publicDescription:
        'Replacement charging contacts for Joy-Cons that have stopped charging in the dock — a common wear failure.',
      category: 'Repair Kits',
      costCents: 300,
      sellingPriceCents: 799,
      quantityOnHand: 90,
      minimumQuantity: 20,
    },
    {
      sku: 'VRAM-GDDR6-K4Z',
      slug: 'gpu-gddr6-vram-replacement-chip',
      publicName: 'GPU GDDR6 VRAM Replacement Chip (Samsung K4Z80325BC)',
      description: 'GDDR6 VRAM replacement chip, Samsung K4Z80325BC, for GPU board repair',
      publicDescription:
        'A common GDDR6 memory chip used across many recent GPU boards — for VRAM-related artifacting or no-display repairs.',
      category: 'Memory',
      manufacturer: 'Samsung',
      costCents: 600,
      sellingPriceCents: 1399,
      quantityOnHand: 25,
      minimumQuantity: 5,
    },
  ]

  for (const product of storeProducts) {
    await prisma.inventoryItem.upsert({
      where: { sku: product.sku },
      update: {},
      create: { ...product, isForSale: true },
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
