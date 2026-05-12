'use client'

import { useState } from 'react'
import type { Flight } from '@/lib/types'

interface ConfirmedDetails {
  owner_name: string
  owner_contact: string
  departure_location: string
  departure_date: string
  departure_time: string | null
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

export default function RequestModal({
  flight,
  onClose,
  onSuccess,
}: {
  flight: Flight
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<ConfirmedDetails | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/flights/${flight.id}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requester_name: name, requester_contact: contact, seats_needed: seats }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      setLoading(false)
      return
    }

    setConfirmed(data)
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {confirmed ? (
          // Success state — show owner contact
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Seat reserved!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Contact {confirmed.owner_name} to confirm the details and arrange your seat.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Owner contact</p>
              <p className="font-semibold text-slate-900 text-lg">{confirmed.owner_contact}</p>
              <p className="text-slate-500 text-sm">{confirmed.owner_name} · {formatDate(confirmed.departure_date)}</p>
              <p className="text-slate-500 text-sm">{confirmed.departure_location}</p>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              This flight has been marked as reserved and is no longer listed publicly.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          // Request form
          <>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Request a seat</h2>
                <p className="text-slate-500 text-sm mt-0.5">{flight.departure_location}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Your contact info will be shared with <span className="font-medium text-slate-700">{flight.owner_name}</span> so they can confirm your seat.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone or email</label>
                  <input
                    required
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="How should they reach you?"
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seats needed</label>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                  >
                    {Array.from({ length: flight.available_seats }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'seat' : 'seats'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? 'Reserving…' : 'Reserve seat'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
