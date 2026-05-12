import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { requester_name, requester_contact, seats_needed } = await req.json()

  if (!requester_name || !requester_contact || !seats_needed) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Atomic claim: only succeeds if flight is still available (prevents race conditions)
  const { data: flight, error: updateError } = await supabaseAdmin
    .from('flights')
    .update({ status: 'requested' })
    .eq('id', params.id)
    .eq('status', 'available')
    .select()
    .single()

  if (updateError || !flight) {
    return NextResponse.json(
      { error: 'This flight is no longer available.' },
      { status: 409 }
    )
  }

  // Record the request
  const { error: requestError } = await supabaseAdmin
    .from('seat_requests')
    .insert({
      flight_id: params.id,
      requester_name,
      requester_contact,
      seats_needed: Number(seats_needed),
    })

  if (requestError) {
    // Roll back status if we couldn't save the request
    await supabaseAdmin
      .from('flights')
      .update({ status: 'available' })
      .eq('id', params.id)
    return NextResponse.json({ error: requestError.message }, { status: 500 })
  }

  // Return owner contact so requester can follow up directly
  return NextResponse.json({
    owner_name: flight.owner_name,
    owner_contact: flight.owner_contact,
    departure_location: flight.departure_location,
    departure_date: flight.departure_date,
    departure_time: flight.departure_time,
  })
}
