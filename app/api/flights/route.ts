import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'

function getSupabaseUser(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const departure = searchParams.get('departure')
  const arrival = searchParams.get('arrival')

  let query = supabaseAdmin
    .from('flights')
    .select('*')
    .eq('status', 'available')
    .gte('departure_date', new Date().toISOString().split('T')[0])
    .order('departure_date', { ascending: true })

  if (date) query = query.eq('departure_date', date)
  if (departure) query = query.eq('departure_fbo', departure)
  if (arrival) query = query.eq('arrival_fbo', arrival)

  const { data: flights, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!flights || flights.length === 0) return NextResponse.json([])

  // Fetch profiles separately for reliability
  const userIds = [...new Set(flights.map((f: any) => f.user_id).filter(Boolean))]
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds)

  const profileMap: Record<string, { name: string; email: string }> = {}
  for (const p of profiles || []) {
    profileMap[p.id] = { name: p.name, email: p.email }
  }

  const result = flights.map((f: any) => ({
    ...f,
    owner_name: profileMap[f.user_id]?.name || 'Unknown',
    owner_email: profileMap[f.user_id]?.email || '',
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseUser(req)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { departure_fbo, arrival_fbo, departure_date, departure_time, available_seats, cost_per_seat, notes } = body

  if (!departure_fbo || !arrival_fbo || !departure_date || !available_seats) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('flights')
    .insert({
      user_id: user.id,
      departure_fbo,
      arrival_fbo,
      departure_date,
      departure_time: departure_time || null,
      available_seats: Number(available_seats),
      cost_per_seat: cost_per_seat ? Number(cost_per_seat) : null,
      notes: notes || null,
      status: 'available',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
