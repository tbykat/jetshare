import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { code } = await req.json()

  if (!code || code !== process.env.COMMUNITY_CODE) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
