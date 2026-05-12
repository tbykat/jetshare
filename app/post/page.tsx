import Navbar from '@/components/Navbar'
import PostFlightForm from '@/components/PostFlightForm'
import Link from 'next/link'

export default function PostPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to flights
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Post a flight</h1>
          <p className="text-slate-500 text-sm mt-1">
            Let community members know you have seats available on your flight to the island.
          </p>
        </div>

        <PostFlightForm />
      </main>
    </>
  )
}
