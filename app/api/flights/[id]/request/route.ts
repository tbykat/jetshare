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

  // Fetch current flight to check availability
  const { data: flight, error: fetchError } = await supabaseAdmin
    .from('flights')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'available')
    .single()

  if (fetchError || !flight) {
    return NextResponse.json({ error: 'This flight is no longer available.' }, { status: 409 })
  }

  if (flight.available_seats < seats_needed) {
    return NextResponse.json({ error: `Only ${flight.available_seats} seat(s) remaining.` }, { status: 409 })
  }

  const newSeatCount = flight.available_seats - seats_needed
  const newStatus = newSeatCount === 0 ? 'requested' : 'available'

  // Reduce seat count (atomic — only succeeds if still available)
  const { error: updateError } = await supabaseAdmin
    .from('flights')
    .update({
      available_seats: newSeatCount,
      status: newStatus,
    })
    .eq('id', params.id)
    .eq('status', 'available')

  if (updateError) {
    return NextResponse.json({ error: 'Failed to reserve seat. Please try again.' }, { status: 500 })
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
    // Roll back seat count if request record failed
    await supabaseAdmin
      .from('flights')
      .update({ available_seats: flight.available_seats, status: 'available' })
      .eq('id', params.id)
    return NextResponse.json({ error: requestError.message }, { status: 500 })
  }

  // Return owner contact so requester can follow up directly
  return NextResponse.json({
    owner_name: flight.owner_name,
    owner_contact: flight.owner_contact,
    departure_fbo: flight.departure_fbo,
    arrival_fbo: flight.arrival_fbo,
    departure_date: flight.departure_date,
    departure_time: flight.departure_time,
    seats_reserved: seats_needed,
    seats_remaining: newSeatCount,
  })
}
