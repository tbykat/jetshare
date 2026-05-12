'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEPARTURE_LOCATIONS } from '@/lib/departures'

export default function PostFlightForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    owner_name: '',
    owner_contact: '',
    departure_location: DEPARTURE_LOCATIONS[0],
    departure_date: '',
    departure_time: '',
    available_seats: 1,
    notes: '',
  })

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      setLoading(false)
      return
    }

    router.push('/?posted=1')
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Your details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Your details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your name</label>
            <input
              required
              type="text"
              value={form.owner_name}
              onChange={(e) => set('owner_name', e.target.value)}
              placeholder="Full name"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone or email</label>
            <input
              required
              type="text"
              value={form.owner_contact}
              onChange={(e) => set('owner_contact', e.target.value)}
              placeholder="How should riders reach you?"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Flight details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Flight details</h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Departure airport</label>
          <select
            value={form.departure_location}
            onChange={(e) => set('departure_location', e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
          >
            {DEPARTURE_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              required
              type="date"
              min={today}
              value={form.departure_date}
              onChange={(e) => set('departure_date', e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Departure time <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="time"
              value={form.departure_time}
              onChange={(e) => set('departure_time', e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Available seats</label>
          <select
            value={form.available_seats}
            onChange={(e) => set('available_seats', Number(e.target.value))}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'seat' : 'seats'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="e.g. Wheels up at 9am sharp, bring luggage under 50lbs, meeting at FBO…"
            rows={3}
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm resize-none"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-colors text-sm"
      >
        {loading ? 'Posting…' : 'Post flight'}
      </button>
    </form>
  )
}
