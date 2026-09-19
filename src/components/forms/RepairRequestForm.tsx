'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const categoryOptions: { value: string; label: string }[] = [
  { value: 'PHONE_TABLET', label: 'Phone / Tablet' },
  { value: 'COMPUTER_MOTHERBOARD', label: 'Computer / Motherboard' },
  { value: 'GPU', label: 'GPU' },
  { value: 'GAME_CONSOLE', label: 'Game Console' },
  { value: 'AUTOMOTIVE_MODULE', label: 'Automotive Module' },
  { value: 'AVIATION_ELECTRONICS', label: 'Aviation Electronics' },
  { value: 'ASIC_MINING_HARDWARE', label: 'ASIC / Mining Hardware' },
  { value: 'INDUSTRIAL_SPECIALTY', label: 'Industrial / Specialty' },
  { value: 'OTHER', label: 'Other' },
]

const OTHER_MANUFACTURER = 'Other (specify below)'

const manufacturersByCategory: Record<string, string[]> = {
  PHONE_TABLET: ['Apple', 'Samsung', 'Google', 'Motorola', 'LG', 'OnePlus', OTHER_MANUFACTURER],
  COMPUTER_MOTHERBOARD: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Microsoft', OTHER_MANUFACTURER],
  GPU: ['NVIDIA', 'AMD', 'ASUS', 'EVGA', 'MSI', 'Gigabyte', 'Zotac', 'PNY', 'Sapphire', OTHER_MANUFACTURER],
  GAME_CONSOLE: ['Sony (PlayStation)', 'Microsoft (Xbox)', 'Nintendo', OTHER_MANUFACTURER],
  AUTOMOTIVE_MODULE: [
    'Ford',
    'GM / Chevrolet',
    'Toyota',
    'Honda',
    'Chrysler / Dodge / Jeep',
    'Nissan',
    'BMW',
    'Mercedes-Benz',
    OTHER_MANUFACTURER,
  ],
  AVIATION_ELECTRONICS: ['Garmin', 'Honeywell', 'Bendix/King', 'Avidyne', OTHER_MANUFACTURER],
  ASIC_MINING_HARDWARE: ['Bitmain (Antminer)', 'MicroBT (Whatsminer)', 'Canaan (Avalon)', OTHER_MANUFACTURER],
  INDUSTRIAL_SPECIALTY: [OTHER_MANUFACTURER],
  OTHER: [OTHER_MANUFACTURER],
}

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC',
]

const SHIPPING_SERVICE_PREFERENCES = new Set(['MAIL_IN', 'SHIP_IN'])

const servicePreferenceOptions: { value: string; label: string; description: string }[] = [
  { value: 'LOCAL_DROP_OFF', label: 'Local Drop-Off', description: 'Harlingen to Mission service area' },
  { value: 'MAIL_IN', label: 'Mail-In', description: 'Ship to our laboratory' },
  { value: 'SHIP_IN', label: 'Ship-In', description: 'Freight or courier shipment' },
  { value: 'BUSINESS_ACCOUNT', label: 'Business Account', description: 'Existing trade account' },
  { value: 'FLEET_SERVICE_ACCOUNT', label: 'Fleet / Service Account', description: 'Recurring fleet service' },
]

const totalSteps = 6

interface FormState {
  name: string
  email: string
  phone: string
  company: string
  category: string
  manufacturer: string
  model: string
  serialNumber: string
  partNumber: string
  errorCode: string
  symptoms: string
  problemStartedAt: string
  previousAttempts: string
  hasLiquidDamage: boolean
  hasPhysicalDamage: boolean
  hasPowerIssue: boolean
  isIntermittent: boolean
  hasNoDisplay: boolean
  hasBootFailure: boolean
  servicePreference: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
  website: string
}

export function RepairRequestForm() {
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [referenceCode, setReferenceCode] = useState('')

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: categoryOptions[0].value,
    manufacturer: '',
    model: '',
    serialNumber: '',
    partNumber: '',
    errorCode: searchParams.get('errorCode') || '',
    symptoms: searchParams.get('symptoms') || '',
    problemStartedAt: '',
    previousAttempts: '',
    hasLiquidDamage: false,
    hasPhysicalDamage: false,
    hasPowerIssue: false,
    isIntermittent: false,
    hasNoDisplay: false,
    hasBootFailure: false,
    servicePreference: servicePreferenceOptions[0].value,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    website: '',
  })
  const [manufacturerChoice, setManufacturerChoice] = useState('')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const manufacturerOptions = manufacturersByCategory[form.category] ?? [OTHER_MANUFACTURER]
  const needsAddress = SHIPPING_SERVICE_PREFERENCES.has(form.servicePreference)

  function handleCategoryChange(category: string) {
    update('category', category)
    setManufacturerChoice('')
    update('manufacturer', '')
  }

  function handleManufacturerChoice(choice: string) {
    setManufacturerChoice(choice)
    update('manufacturer', choice === OTHER_MANUFACTURER ? '' : choice)
  }

  function next() {
    setStep((current) => Math.min(current + 1, totalSteps))
  }

  function back() {
    setStep((current) => Math.max(current - 1, 1))
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || [])
    setFiles((prev) => [...prev, ...selected].slice(0, 6))
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, typeof value === 'boolean' ? String(value) : value)
      })
      files.forEach((file) => formData.append('files', file))

      const response = await fetch('/api/repair-requests', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      const data = await response.json()
      setReferenceCode(data.referenceCode)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <div className="panel p-8 text-center">
        <h2 className="text-xl font-bold text-lab-text">Request Received.</h2>
        <p className="mt-3 text-sm text-lab-muted">
          A technician will review the information and determine the appropriate diagnostic path.
        </p>
        <p className="mt-4 font-mono text-sm text-lab-accent">Reference: {referenceCode}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-6 sm:p-8">
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        value={form.website}
        onChange={(event) => update('website', event.target.value)}
      />

      <ol className="mb-8 flex flex-wrap gap-2 text-xs text-lab-muted">
        {['Customer', 'Equipment', 'Failure', 'Upload', 'Service', 'Review'].map((label, index) => (
          <li
            key={label}
            className={`rounded-sm border px-3 py-1 ${
              step === index + 1
                ? 'border-lab-accent text-lab-accent'
                : step > index + 1
                  ? 'border-lab-line text-lab-text'
                  : 'border-lab-line text-lab-muted'
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Customer Information</legend>
          <TextField label="Full Name" required value={form.name} onChange={(v) => update('name', v)} />
          <TextField label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
          <TextField label="Phone" type="tel" required value={form.phone} onChange={(v) => update('phone', v)} />
          <TextField label="Company (optional)" value={form.company} onChange={(v) => update('company', v)} />
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Equipment</legend>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Category</label>
            <select
              value={form.category}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Manufacturer <span className="text-lab-accent">*</span>
            </label>
            <select
              required
              value={manufacturerChoice}
              onChange={(event) => handleManufacturerChoice(event.target.value)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            >
              <option value="" disabled>
                Select manufacturer…
              </option>
              {manufacturerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {manufacturerChoice === OTHER_MANUFACTURER && (
              <input
                type="text"
                required
                placeholder="Enter manufacturer"
                value={form.manufacturer}
                onChange={(event) => update('manufacturer', event.target.value)}
                className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
              />
            )}
          </div>
          <TextField label="Model" required value={form.model} onChange={(v) => update('model', v)} />
          <TextField label="Serial Number (optional)" value={form.serialNumber} onChange={(v) => update('serialNumber', v)} />
          <TextField label="Part Number (optional)" value={form.partNumber} onChange={(v) => update('partNumber', v)} />
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="grid gap-4">
          <legend className="sr-only">Failure Details</legend>
          <TextField label="Error Code (if known)" value={form.errorCode} onChange={(v) => update('errorCode', v)} />
          <TextAreaField label="Symptoms" required rows={4} value={form.symptoms} onChange={(v) => update('symptoms', v)} />
          <TextField
            label="When Did the Problem Start?"
            value={form.problemStartedAt}
            onChange={(v) => update('problemStartedAt', v)}
          />
          <TextAreaField
            label="Previous Repair Attempts"
            rows={3}
            value={form.previousAttempts}
            onChange={(v) => update('previousAttempts', v)}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <CheckboxField label="Liquid damage?" checked={form.hasLiquidDamage} onChange={(v) => update('hasLiquidDamage', v)} />
            <CheckboxField label="Physical damage?" checked={form.hasPhysicalDamage} onChange={(v) => update('hasPhysicalDamage', v)} />
            <CheckboxField label="Power issue?" checked={form.hasPowerIssue} onChange={(v) => update('hasPowerIssue', v)} />
            <CheckboxField label="Intermittent?" checked={form.isIntermittent} onChange={(v) => update('isIntermittent', v)} />
            <CheckboxField label="No display?" checked={form.hasNoDisplay} onChange={(v) => update('hasNoDisplay', v)} />
            <CheckboxField label="Boot failure?" checked={form.hasBootFailure} onChange={(v) => update('hasBootFailure', v)} />
          </div>
        </fieldset>
      )}

      {step === 4 && (
        <fieldset id="upload" className="grid gap-4">
          <legend className="sr-only">Upload</legend>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Photos, Videos, Error Screenshots, Board Images, or Diagnostic Reports
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileChange}
              className="mt-2 w-full rounded-sm border border-dashed border-lab-line bg-lab-panel2 px-3 py-6 text-sm text-lab-muted file:mr-4 file:rounded-sm file:border-0 file:bg-lab-accent file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-lab-bg"
            />
            <p className="mt-2 text-xs text-lab-muted">Up to 6 files, 8MB each.</p>
          </div>
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-sm border border-lab-line px-3 py-2 text-xs text-lab-muted"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-3 text-lab-danger"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      )}

      {step === 5 && (
        <fieldset className="grid gap-3">
          <legend className="sr-only">Service Preference</legend>
          {servicePreferenceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 ${
                form.servicePreference === option.value
                  ? 'border-lab-accent bg-lab-panel2'
                  : 'border-lab-line'
              }`}
            >
              <input
                type="radio"
                name="servicePreference"
                value={option.value}
                checked={form.servicePreference === option.value}
                onChange={(event) => update('servicePreference', event.target.value)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-lab-text">{option.label}</span>
                <span className="block text-xs text-lab-muted">{option.description}</span>
              </span>
            </label>
          ))}

          {needsAddress && (
            <div className="mt-4 grid gap-4 rounded-sm border border-lab-line p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-lab-accent">
                  Mailing Address
                </p>
                <p className="mt-1 text-xs text-lab-muted">
                  Required for mail-in/ship-in service — this is where your repaired device or
                  board will be shipped back to.
                </p>
              </div>
              <TextField
                label="Street Address"
                required
                value={form.addressLine1}
                onChange={(v) => update('addressLine1', v)}
              />
              <TextField
                label="Apt / Suite (optional)"
                value={form.addressLine2}
                onChange={(v) => update('addressLine2', v)}
              />
              <TextField label="City" required value={form.city} onChange={(v) => update('city', v)} />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                  State <span className="text-lab-accent">*</span>
                </label>
                <select
                  required
                  value={form.state}
                  onChange={(event) => update('state', event.target.value)}
                  className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
                >
                  <option value="" disabled>
                    Select state…
                  </option>
                  {usStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <TextField label="ZIP Code" required value={form.zip} onChange={(v) => update('zip', v)} />
            </div>
          )}
        </fieldset>
      )}

      {step === 6 && (
        <div className="space-y-4 text-sm text-lab-muted">
          <h2 className="text-base font-semibold text-lab-text">Review &amp; Submit</h2>
          <ReviewRow label="Name" value={form.name} />
          <ReviewRow label="Email" value={form.email} />
          <ReviewRow label="Phone" value={form.phone} />
          <ReviewRow label="Equipment" value={`${form.manufacturer} ${form.model}`.trim()} />
          <ReviewRow label="Symptoms" value={form.symptoms} />
          <ReviewRow label="Service Preference" value={form.servicePreference.replace(/_/g, ' ')} />
          {needsAddress && (
            <ReviewRow
              label="Mailing Address"
              value={[form.addressLine1, form.addressLine2, form.city, form.state, form.zip]
                .filter(Boolean)
                .join(', ')}
            />
          )}
          <ReviewRow label="Files Attached" value={String(files.length)} />
          {status === 'error' && <p className="text-sm text-lab-danger">{errorMessage}</p>}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < totalSteps ? (
          <button type="button" onClick={next} className="btn-primary">
            Continue
          </button>
        ) : (
          <button type="submit" disabled={status === 'submitting'} className="btn-primary disabled:opacity-60">
            {status === 'submitting' ? 'Submitting…' : 'Submit for Technical Review'}
          </button>
        )}
      </div>
    </form>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
        {label}
        {required && <span className="text-lab-accent"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
        {label}
        {required && <span className="text-lab-accent"> *</span>}
      </label>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
      />
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-sm border border-lab-line px-3 py-2 text-xs text-lab-muted">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-lab-line pb-2 sm:flex-row sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{label}</span>
      <span className="text-sm text-lab-text sm:text-right">{value || '—'}</span>
    </div>
  )
}
