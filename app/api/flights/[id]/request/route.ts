import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get authenticated requester
  const supabase = getSupabaseUser(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get requester's profile
  const { data: requesterProfile } = await supabaseAdmin
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  if (!requesterProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 400 })

  const { seats_needed, notes } = await req.json()
  if (!seats_needed) return NextResponse.json({ error: 'Missing seats_needed' }, { status: 400 })

  // Get flight
  const { data: flight, error: fetchError } = await supabaseAdmin
    .from('flights')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'available')
    .single()

  if (fetchError || !flight) {
    return NextResponse.json({ error: 'This flight is no longer available.' }, { status: 409 })
  }

  // Get owner profile separately
  const { data: ownerProfile } = await supabaseAdmin
    .from('profiles')
    .select('name, email')
    .eq('id', flight.user_id)
    .single()

  if (flight.available_seats < seats_needed) {
    return NextResponse.json({ error: `Only ${flight.available_seats} seat(s) remaining.` }, { status: 409 })
  }

  // Prevent owner from requesting their own flight
  if (flight.user_id === user.id) {
    return NextResponse.json({ error: "You can't request your own flight." }, { status: 400 })
  }

  const newSeatCount = flight.available_seats - seats_needed
  const newStatus = newSeatCount === 0 ? 'requested' : 'available'

  // Reduce seats atomically
  const { error: updateError } = await supabaseAdmin
    .from('flights')
    .update({ available_seats: newSeatCount, status: newStatus })
    .eq('id', params.id)
    .eq('status', 'available')

  if (updateError) {
    return NextResponse.json({ error: 'Failed to reserve seat. Please try again.' }, { status: 500 })
  }

  // Record the request
  await supabaseAdmin.from('seat_requests').insert({
    flight_id: params.id,
    user_id: user.id,
    seats_needed: Number(seats_needed),
    notes: notes || null,
  })

  // Email the flight owner
  const ownerEmail = ownerProfile?.email
  const ownerName = ownerProfile?.name || 'there'

  if (ownerEmail) {
    await resend.emails.send({
      from: 'JetShare <onboarding@resend.dev>',
      to: ownerEmail,
      subject: `${requesterProfile.name} wants ${seats_needed} seat${seats_needed > 1 ? 's' : ''} on your flight`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0ea5e9; margin-bottom: 4px;">✈️ New seat request</h2>
          <p style="color: #64748b; margin-top: 0;">Hi ${ownerName}, someone wants to join your flight.</p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0;"><strong>From:</strong> ${requesterProfile.name}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${requesterProfile.email}</p>
            <p style="margin: 0 0 8px 0;"><strong>Seats:</strong> ${seats_needed}</p>
            ${notes ? `<p style="margin: 0 0 8px 0;"><strong>Note:</strong> ${notes}</p>` : ''}
            <p style="margin: 0 0 8px 0;"><strong>Flight:</strong> ${formatDate(flight.departure_date)}</p>
            <p style="margin: 0;"><strong>Route:</strong> ${flight.departure_fbo} → ${flight.arrival_fbo}</p>
          </div>

          ${newSeatCount > 0
            ? `<p style="color: #10b981;">${newSeatCount} seat${newSeatCount > 1 ? 's' : ''} still available on your flight.</p>`
            : `<p style="color: #f59e0b;">Your flight is now fully booked.</p>`}

          <p style="color: #475569;">Reply directly to <strong>${requesterProfile.email}</strong> to confirm.</p>
          <p style="color: #94a3b8; font-size: 13px;">— JetShare</p>
        </div>
      `,
    }).catch(() => {})
  }

  return NextResponse.json({
    owner_name: ownerName,
    owner_email: ownerEmail,
    departure_fbo: flight.departure_fbo,
    arrival_fbo: flight.arrival_fbo,
    departure_date: flight.departure_date,
    departure_time: flight.departure_time,
    seats_reserved: seats_needed,
    seats_remaining: newSeatCount,
  })
}
