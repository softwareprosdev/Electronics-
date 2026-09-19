import { z } from 'zod'

export const equipmentCategoryEnum = z.enum([
  'PHONE_TABLET',
  'COMPUTER_MOTHERBOARD',
  'GPU',
  'GAME_CONSOLE',
  'AUTOMOTIVE_MODULE',
  'AVIATION_ELECTRONICS',
  'ASIC_MINING_HARDWARE',
  'INDUSTRIAL_SPECIALTY',
  'OTHER',
])

export const servicePreferenceEnum = z.enum([
  'LOCAL_DROP_OFF',
  'MAIL_IN',
  'SHIP_IN',
  'BUSINESS_ACCOUNT',
  'FLEET_SERVICE_ACCOUNT',
])

const baseRepairRequestSchema = z.object({
  // Step 1 — customer
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('A valid email is required').max(200),
  phone: z.string().trim().min(7, 'A valid phone number is required').max(30),
  company: z.string().trim().max(200).optional().or(z.literal('')),

  // Step 2 — equipment
  category: equipmentCategoryEnum,
  manufacturer: z.string().trim().min(1, 'Manufacturer is required').max(120),
  model: z.string().trim().min(1, 'Model is required').max(120),
  serialNumber: z.string().trim().max(120).optional().or(z.literal('')),
  partNumber: z.string().trim().max(120).optional().or(z.literal('')),

  // Step 3 — failure
  errorCode: z.string().trim().max(120).optional().or(z.literal('')),
  symptoms: z.string().trim().min(10, 'Please describe the symptoms in more detail').max(4000),
  problemStartedAt: z.string().trim().max(200).optional().or(z.literal('')),
  previousAttempts: z.string().trim().max(2000).optional().or(z.literal('')),
  hasLiquidDamage: z.boolean().default(false),
  hasPhysicalDamage: z.boolean().default(false),
  hasPowerIssue: z.boolean().default(false),
  isIntermittent: z.boolean().default(false),
  hasNoDisplay: z.boolean().default(false),
  hasBootFailure: z.boolean().default(false),

  // Step 5 — service preference + mailing address (required for
  // mail-in/ship-in, since that's the address the repaired item ships back
  // to; optional otherwise but still collected when offered).
  servicePreference: servicePreferenceEnum,
  addressLine1: z.string().trim().max(200).optional().or(z.literal('')),
  addressLine2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  state: z.string().trim().max(60).optional().or(z.literal('')),
  zip: z.string().trim().max(20).optional().or(z.literal('')),

  // honeypot
  website: z.string().max(0).optional().or(z.literal('')),
})

const SHIPPING_SERVICE_PREFERENCES = new Set(['MAIL_IN', 'SHIP_IN'])

export const repairRequestSchema = baseRepairRequestSchema.superRefine((data, ctx) => {
  if (!SHIPPING_SERVICE_PREFERENCES.has(data.servicePreference)) return

  const required: Array<[keyof typeof data, string]> = [
    ['addressLine1', 'Street address'],
    ['city', 'City'],
    ['state', 'State'],
    ['zip', 'ZIP code'],
  ]

  for (const [field, label] of required) {
    if (!data[field]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${label} is required for mail-in/ship-in service so we know where to send your device back.`,
      })
    }
  }
})

export type RepairRequestInput = z.infer<typeof baseRepairRequestSchema>

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(4000),
  type: z.enum(['GENERAL', 'BUSINESS_ACCOUNT', 'REPAIR_SHOP_PARTNER', 'MEDIA']).default('GENERAL'),
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>

export const businessAccountSchema = z.object({
  shopName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  website: z.string().trim().max(300).optional().or(z.literal('')),
  monthlyVolume: z.string().trim().max(120).optional().or(z.literal('')),
  equipmentTypes: z.string().trim().max(1000).optional().or(z.literal('')),
  outsourcingNeeds: z.string().trim().max(2000).optional().or(z.literal('')),
  accountType: z.enum(['trade', 'fleet', 'insurance', 'refurbisher']).default('trade'),
  website_hp: z.string().max(0).optional().or(z.literal('')),
})

export type BusinessAccountInput = z.infer<typeof businessAccountSchema>
