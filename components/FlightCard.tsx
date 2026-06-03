'use client'

import { useState } from 'react'
import type { Flight } from '@/lib/types'
import RequestModal from './RequestModal'

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function shortFBO(fbo: string) {
  // Return just the ICAO code before the dash
  return fbo.split('—')[0].trim()
}

function seatLabel(n: number) {
  return n === 1 ? '1 seat available' : `${n} seats available`
}

export default function FlightCard({ flight, currentUserId, onClaimed }: { flight: Flight; currentUserId: string; onClaimed: () => void }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-white min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-sky-100 mb-0.5">From</p>
              <p className="font-semibold text-sm leading-tight truncate">{flight.departure_fbo}</p>
            </div>
            <div className="text-white text-lg shrink-0">→</div>
            <div className="text-white min-w-0 text-right">
              <p className="text-xs font-medium uppercase tracking-widest text-sky-100 mb-0.5">To</p>
              <p className="font-semibold text-sm leading-tight truncate">{flight.arrival_fbo}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">{formatDate(flight.departure_date)}</p>
              {formatTime(flight.departure_time) && (
                <p className="text-slate-500 text-sm mt-0.5">Departing at {formatTime(flight.departure_time)}</p>
              )}
            </div>
            <span className="shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
              {seatLabel(flight.available_seats)}
            </span>
          </div>

          {/* Cost per seat */}
          {flight.cost_per_seat != null && flight.cost_per_seat > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                ${flight.cost_per_seat.toLocaleString()} / seat
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span>Posted by <span className="text-slate-700 font-medium">{flight.owner_name}</span></span>
          </div>

          {flight.notes && (
            <p className="text-slate-500 text-sm bg-slate-50 rounded-lg px-3 py-2 italic">
              "{flight.notes}"
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Request a seat
          </button>
        </div>
      </div>

      {showModal && (
        <RequestModal
          flight={flight}
          onClose={() => {
            setShowModal(false)
            onClaimed()
          }}
          onSuccess={() => {
            // Do nothing here — let the modal show the confirmation screen
            // onClaimed() is called when user clicks Done (via onClose)
          }}
        />
      )}
    </>
  )
}
