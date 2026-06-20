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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseUser(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: flight } = await supabaseAdmin
    .from('flights').select('user_id').eq('id', params.id).single()

  if (!flight || flight.user_id !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { departure_fbo, arrival_fbo, departure_date, departure_time, available_seats, cost_per_seat, notes } = body

  const { data, error } = await supabaseAdmin
    .from('flights')
    .update({
      departure_fbo,
      arrival_fbo,
      departure_date,
      departure_time: departure_time || null,
      available_seats: Number(available_seats),
      cost_per_seat: cost_per_seat ? Number(cost_per_seat) : null,
      notes: notes || null,
      status: Number(available_seats) > 0 ? 'available' : 'requested',
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseUser(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: flight } = await supabaseAdmin
    .from('flights').select('user_id').eq('id', params.id).single()

  if (!flight || flight.user_id !== user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin.from('flights').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
