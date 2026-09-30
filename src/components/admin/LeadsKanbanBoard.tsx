'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

const STAGES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'DIAGNOSTIC_PENDING',
  'ESTIMATE_PENDING',
  'ESTIMATE_SENT',
  'FOLLOW_UP',
  'APPROVED',
  'CONVERTED',
  'LOST',
] as const

type Stage = (typeof STAGES)[number]

const STAGE_LABELS: Record<Stage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  DIAGNOSTIC_PENDING: 'Diagnostic Pending',
  ESTIMATE_PENDING: 'Estimate Pending',
  ESTIMATE_SENT: 'Estimate Sent',
  FOLLOW_UP: 'Follow-Up',
  APPROVED: 'Approved',
  CONVERTED: 'Converted',
  LOST: 'Lost',
}

const PRIORITY_STYLE: Record<string, string> = {
  LOW: 'border-lab-line text-lab-muted',
  NORMAL: 'border-lab-line text-lab-muted',
  HIGH: 'border-lab-warn/40 text-lab-warn',
  URGENT: 'border-lab-danger/40 text-lab-danger',
}

export interface LeadCardData {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  deviceDescription: string | null
  problemDescription: string | null
  source: string
  status: Stage
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  estimatedValueCents: number | null
  notes: string | null
  followUpDate: string | null
  assignedToId: string | null
  convertedCustomerId: string | null
  createdAt: string
}

export interface AssignableUser {
  id: string
  name: string
}

export function LeadsKanbanBoard({
  initialLeads,
  users,
}: {
  initialLeads: LeadCardData[]
  users: AssignableUser[]
}) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const draggingIdRef = useRef<string | null>(null)

  const selected = leads.find((l) => l.id === selectedId) || null

  async function patchLead(id: string, data: Record<string, unknown>) {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to update lead.')
    }
    return response.json()
  }

  async function handleDrop(stage: Stage) {
    setDragOverStage(null)
    const id = draggingIdRef.current
    if (!id) return
    const previous = leads
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: stage } : l)))
    try {
      await patchLead(id, { status: stage })
      router.refresh()
    } catch {
      setLeads(previous)
    }
  }

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage)
          return (
            <div
              key={stage}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOverStage(stage)
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={(event) => {
                event.preventDefault()
                handleDrop(stage)
              }}
              className={`w-64 flex-none rounded-sm border p-2 ${
                dragOverStage === stage ? 'border-lab-accent bg-lab-accent/5' : 'border-lab-line'
              }`}
            >
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
                  {STAGE_LABELS[stage]}
                </p>
                <span className="text-xs text-lab-muted">{stageLeads.length}</span>
              </div>
              <div className="mt-1 space-y-2">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => {
                      draggingIdRef.current = lead.id
                    }}
                    onClick={() => setSelectedId(lead.id)}
                    className="cursor-pointer rounded-sm border border-lab-line bg-lab-panel p-3 text-sm hover:border-lab-accent/60"
                  >
                    <p className="font-medium text-lab-text">{lead.name}</p>
                    {lead.company && <p className="text-xs text-lab-muted">{lead.company}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`rounded-sm border px-2 py-0.5 text-[10px] ${PRIORITY_STYLE[lead.priority]}`}
                      >
                        {lead.priority}
                      </span>
                      {lead.followUpDate && (
                        <span className="text-[10px] text-lab-muted">
                          Follow up {new Date(lead.followUpDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <p className="px-2 py-3 text-xs text-lab-muted">Drop leads here</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <LeadDetailDrawer
          lead={selected}
          users={users}
          onClose={() => setSelectedId(null)}
          onSaved={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function LeadDetailDrawer({
  lead,
  users,
  onClose,
  onSaved,
}: {
  lead: LeadCardData
  users: AssignableUser[]
  onClose: () => void
  onSaved: (lead: LeadCardData) => void
}) {
  const [priority, setPriority] = useState(lead.priority)
  const [assignedToId, setAssignedToId] = useState(lead.assignedToId || '')
  const [notes, setNotes] = useState(lead.notes || '')
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? lead.followUpDate.slice(0, 10) : '',
  )
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority,
          assignedToId: assignedToId || null,
          notes,
          followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to save.')
      onSaved(data.lead)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleConvert() {
    setConverting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}/convert`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to convert.')
      onSaved(data.lead)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert.')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-lab-line bg-lab-panel p-6 shadow-lg">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-lab-text">{lead.name}</h3>
            <p className="text-sm text-lab-muted">
              {lead.email}
              {lead.phone && ` · ${lead.phone}`}
            </p>
          </div>
          <button onClick={onClose} className="text-sm text-lab-muted hover:text-lab-accent">
            Close
          </button>
        </div>

        {lead.problemDescription && (
          <p className="mt-3 text-sm text-lab-text">{lead.problemDescription}</p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Priority
            </label>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as LeadCardData['priority'])}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Assigned To
            </label>
            <select
              value={assignedToId}
              onChange={(event) => setAssignedToId(event.target.value)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
              Follow-Up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
            />
          </div>
          <div className="flex items-end">
            {lead.convertedCustomerId ? (
              <span className="text-sm text-lab-accent">Converted to customer</span>
            ) : (
              <button
                onClick={handleConvert}
                disabled={converting}
                className="btn-primary w-full disabled:opacity-60"
              >
                {converting ? 'Converting…' : 'Convert to Customer'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className="mt-2 w-full rounded-sm border border-lab-line bg-lab-panel2 px-3 py-2 text-sm text-lab-text focus:border-lab-accent"
          />
        </div>

        {error && <p className="mt-3 text-sm text-lab-danger">{error}</p>}

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-4 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
