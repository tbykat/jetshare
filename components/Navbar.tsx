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
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <span className="text-xl">✈️</span>
          JetShare
        </Link>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-slate-500 text-sm hidden sm:block">
              {userName}
            </span>
          )}
          <Link
            href="/post"
            className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Post a flight
          </Link>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 text-sm px-3 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
