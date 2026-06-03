'use client'

import { useState } from 'react'
import type { Flight } from '@/lib/types'

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

interface ConfirmedDetails {
  seats_reserved: number
  seats_remaining: number
  departure_fbo: string
  arrival_fbo: string
  departure_date: string
  owner_name: string
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
  const [seats, setSeats] = useState(1)
  const [notes, setNotes] = useState('')
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
      body: JSON.stringify({ seats_needed: seats, notes }),
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
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Request sent!</h2>
            <p className="text-slate-500 text-sm mb-6">
              <span className="font-medium text-slate-700">{confirmed.owner_name}</span> has been emailed and will reach out to confirm your seat.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-1.5 mb-4 text-sm">
              <p className="text-slate-700"><span className="text-slate-400">Route:</span> {confirmed.departure_fbo} → {confirmed.arrival_fbo}</p>
              <p className="text-slate-700"><span className="text-slate-400">Date:</span> {formatDate(confirmed.departure_date)}</p>
              <p className="text-slate-700"><span className="text-slate-400">Seats:</span> {confirmed.seats_reserved}</p>
            </div>

            {confirmed.seats_remaining > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                {confirmed.seats_remaining} seat{confirmed.seats_remaining > 1 ? 's' : ''} still available on this flight
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Request a seat</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {flight.departure_fbo} → {flight.arrival_fbo}
                </p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Your name and email will be sent to <span className="font-medium text-slate-700">{flight.owner_name}</span> automatically.
              </p>

              {flight.cost_per_seat != null && flight.cost_per_seat > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <span className="font-semibold">${flight.cost_per_seat.toLocaleString()} per seat</span> — arrange payment with the owner.
                </div>
              )}

              <div className="space-y-3">
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Note to owner <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. travelling with a dog, need luggage space…"
                    rows={2}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? 'Sending request…' : 'Send request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
