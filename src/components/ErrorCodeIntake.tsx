'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const deviceOptions = [
  'iPhone',
  'iPad',
  'Android Phone / Tablet',
  'Computer / Motherboard',
  'GPU',
  'PS5',
  'Xbox',
  'Nintendo Switch',
  'Automotive Module',
  'Aviation Electronics',
  'ASIC / Mining Hardware',
  'Other',
]

export function ErrorCodeIntake() {
  const router = useRouter()
  const [device, setDevice] = useState(deviceOptions[0])
  const [errorCode, setErrorCode] = useState('')
  const [symptoms, setSymptoms] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams({ device, errorCode, symptoms })
    router.push(`/request-repair?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-4 p-6 sm:grid-cols-2">
      <div>
        <label htmlFor="device" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Device
        </label>
        <select
          id="device"
          value={device}
          onChange={(event) => setDevice(event.target.value)}
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        >
          {deviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="errorCode" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Error Code (if known)
        </label>
        <input
          id="errorCode"
          value={errorCode}
          onChange={(event) => setErrorCode(event.target.value)}
          placeholder="e.g. 4013, 0xC1900101, CE-108255-1"
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="symptoms" className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
          Symptoms
        </label>
        <textarea
          id="symptoms"
          value={symptoms}
          onChange={(event) => setSymptoms(event.target.value)}
          rows={3}
          placeholder="Describe what the device is doing (or not doing), including any previous repair attempts."
          className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
        />
      </div>

      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary w-full sm:w-auto">
          Submit for Technical Review
        </button>
      </div>
    </form>
  )
}
