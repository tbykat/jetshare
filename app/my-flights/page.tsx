'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Flight } from '@/lib/types'
import Navbar from '@/components/Navbar'
import EditFlightModal from '@/components/EditFlightModal'
import { createClient } from '@/lib/supabase-browser'

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function MyFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('name').eq('id', user.id).single()
          .then(({ data }) => { if (data) setUserName(data.name) })
      }
    })
  }, [])

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/flights?mine=true')
    const data = await res.json()
    setFlights(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchFlights() }, [fetchFlights])

  async function handleDelete(id: string) {
    if (!confirm('Delete this flight? This cannot be undone.')) return
    setDeletingId(id)
    await fetch(`/api/flights/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchFlights()
  }

  const upcoming = flights.filter(f => f.departure_date >= new Date().toISOString().split('T')[0])
  const past = flights.filter(f => f.departure_date < new Date().toISOString().split('T')[0])

  return (
    <>
      <Navbar userName={userName} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My flights</h1>
          <p className="text-slate-500 text-sm mt-1">Manage flights you've posted</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-28 animate-pulse" />
            ))}
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✈️</div>
            <p className="text-slate-700 font-semibold text-lg">No flights posted yet</p>
            <p className="text-slate-400 text-sm mt-1">Head back home to post a flight with open seats</p>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Upcoming</h2>
                <div className="space-y-3">
                  {upcoming.map((flight) => (
                    <FlightRow
                      key={flight.id}
                      flight={flight}
                      onEdit={() => setEditingFlight(flight)}
                      onDelete={() => handleDelete(flight.id)}
                      deleting={deletingId === flight.id}
                    />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Past</h2>
                <div className="space-y-3 opacity-60">
                  {past.map((flight) => (
                    <FlightRow
                      key={flight.id}
                      flight={flight}
                      onEdit={() => setEditingFlight(flight)}
                      onDelete={() => handleDelete(flight.id)}
                      deleting={deletingId === flight.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {editingFlight && (
        <EditFlightModal
          flight={editingFlight}
          onClose={() => setEditingFlight(null)}
          onSaved={fetchFlights}
        />
      )}
    </>
  )
}

function FlightRow({
  flight,
  onEdit,
  onDelete,
  deleting,
}: {
  flight: Flight
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">{flight.departure_fbo.split('—')[0].trim()}</span>
          <span className="text-slate-400 text-sm">→</span>
          <span className="font-semibold text-slate-900 text-sm">{flight.arrival_fbo.split('—')[0].trim()}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            flight.status === 'available'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {flight.status === 'available' ? `${flight.available_seats} seat${flight.available_seats !== 1 ? 's' : ''} open` : 'Full'}
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          {formatDate(flight.departure_date)}
          {formatTime(flight.departure_time) && ` · ${formatTime(flight.departure_time)}`}
          {flight.cost_per_seat ? ` · $${flight.cost_per_seat.toLocaleString()}/seat` : ''}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="text-slate-500 hover:text-sky-600 border border-slate-200 hover:border-sky-300 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
