'use client'

import { useState } from 'react'

export default function CommunityGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (res.ok) {
      sessionStorage.setItem('js_auth', '1')
      onAuthenticated()
    } else {
      setError('Incorrect code. Please check with a community member.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/20 rounded-2xl mb-4">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">JetShare</h1>
          <p className="text-slate-400 text-sm mt-1">Private community seat sharing</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-white font-semibold text-lg mb-1">Community access</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enter your community code to view and share available seats.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Community code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !code}
              className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl py-3 transition-colors"
            >
              {loading ? 'Verifying…' : 'Enter community'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
