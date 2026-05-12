import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <span className="text-xl">✈️</span>
          JetShare
        </Link>
        <Link
          href="/post"
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Post a flight
        </Link>
      </div>
    </header>
  )
}
