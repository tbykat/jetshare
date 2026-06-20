'use client'

import { useState } from 'react'
import type { Flight } from '@/lib/types'
import { DEPARTURE_FBOS, ARRIVAL_FBOS } from '@/lib/departures'

export default function EditFlightModal({
  flight,
  onClose,
  onSaved,
}: {
  flight: Flight
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    departure_fbo: flight.departure_fbo,
    arrival_fbo: flight.arrival_fbo,
    departure_date: flight.departure_date,
    departure_time: flight.departure_time || '',
    available_seats: String(flight.available_seats),
    cost_per_seat: flight.cost_per_seat != null ? String(flight.cost_per_seat) : '',
    notes: flight.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/flights/${flight.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        available_seats: Number(form.available_seats),
        cost_per_seat: form.cost_per_seat ? Number(form.cost_per_seat) : null,
        departure_time: form.departure_time || null,
        notes: form.notes || null,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Failed to save')
      return
    }
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Edit flight</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Departing from</label>
            <select
              value={form.departure_fbo}
              onChange={(e) => set('departure_fbo', e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {DEPARTURE_FBOS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Arriving at</label>
            <select
              value={form.arrival_fbo}
              onChange={(e) => set('arrival_fbo', e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {ARRIVAL_FBOS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Date</label>
              <input
                type="date"
                value={form.departure_date}
                onChange={(e) => set('departure_date', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Time (optional)</label>
              <input
                type="time"
                value={form.departure_time}
                onChange={(e) => set('departure_time', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Available seats</label>
              <input
                type="number"
                min="0"
                max="20"
                value={form.available_seats}
                onChange={(e) => set('available_seats', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Cost per seat ($)</label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                value={form.cost_per_seat}
                onChange={(e) => set('cost_per_seat', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="Anything useful for riders to know"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
