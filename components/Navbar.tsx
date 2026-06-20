'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function Navbar({ userName }: { userName?: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-1.5 font-bold text-slate-900 text-base shrink-0">
          <span>✈️</span>
          <span className="hidden sm:inline">JetShare</span>
        </Link>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="text-slate-500 text-sm hidden md:block">
              {userName}
            </span>
          )}

          <Link
            href="/my-flights"
            className="text-slate-600 hover:text-slate-900 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors whitespace-nowrap"
          >
            My flights
          </Link>

          <Link
            href="/post"
            className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">+ Post a flight</span>
            <span className="sm:hidden">+ Post</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 text-sm px-2 py-1.5 rounded-lg border border-slate-200 transition-colors whitespace-nowrap"
            aria-label="Sign out"
          >
            <span className="hidden sm:inline">Sign out</span>
            {/* Icon-only on very small screens */}
            <svg className="sm:hidden w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
