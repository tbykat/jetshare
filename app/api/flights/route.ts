import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    .order('departure_time', { ascending: true })

  if (date) query = query.eq('departure_date', date)
  if (departure) query = query.eq('departure_fbo', departure)
  if (arrival) query = query.eq('arrival_fbo', arrival)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    owner_name,
    owner_contact,
    departure_fbo,
    arrival_fbo,
    departure_date,
    departure_time,
    available_seats,
    cost_per_seat,
    notes,
  } = body

  if (!owner_name || !owner_contact || !departure_fbo || !arrival_fbo || !departure_date || !available_seats) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('flights')
    .insert({
      owner_name,
      owner_contact,
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
