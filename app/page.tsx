'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Flight } from '@/lib/types'
import { DEPARTURE_LOCATIONS } from '@/lib/departures'
import CommunityGate from '@/components/CommunityGate'
import Navbar from '@/components/Navbar'
import FlightCard from '@/components/FlightCard'

export default function Home() {
  const searchParams = useSearchParams()
  const [authed, setAuthed] = useState(false)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterDeparture, setFilterDeparture] = useState('')
  const [justPosted, setJustPosted] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('js_auth') === '1') setAuthed(true)
    if (searchParams.get('posted') === '1') setJustPosted(true)
  }, [searchParams])

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterDate) params.set('date', filterDate)
    if (filterDeparture) params.set('departure', filterDeparture)

    const res = await fetch(`/api/flights?${params}`)
    const data = await res.json()
    setFlights(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filterDate, filterDeparture])

  useEffect(() => {
    if (authed) fetchFlights()
  }, [authed, fetchFlights])

  if (!authed) {
    return <CommunityGate onAuthenticated={() => setAuthed(true)} />
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {justPosted && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 mb-6 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Your flight has been posted. Community members can now request seats.
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Available flights</h1>
          <p className="text-slate-500 text-sm mt-1">Browse open seats on upcoming island flights</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
          />
          <select
            value={filterDeparture}
            onChange={(e) => setFilterDeparture(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
          >
            <option value="">All airports</option>
            {DEPARTURE_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          {(filterDate || filterDeparture) && (
            <button
              onClick={() => { setFilterDate(''); setFilterDeparture('') }}
              className="text-slate-500 hover:text-slate-700 text-sm px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✈️</div>
            <p className="text-slate-700 font-semibold text-lg">No flights available</p>
            <p className="text-slate-400 text-sm mt-1">
              {filterDate || filterDeparture
                ? 'Try clearing your filters'
                : 'Be the first to post a flight with open seats'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onClaimed={fetchFlights}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
