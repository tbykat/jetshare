import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JetShare',
  description: 'Share empty seats on private jets to the island.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">{children}</body>
    </html>
  )
}
