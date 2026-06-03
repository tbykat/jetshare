export type FlightStatus = 'available' | 'requested'

export interface Profile {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Flight {
  id: string
  user_id: string
  owner_name: string   // joined from profiles
  owner_email: string  // joined from profiles
  departure_fbo: string
  arrival_fbo: string
  departure_date: string
  departure_time: string | null
  available_seats: number
  cost_per_seat: number | null
  notes: string | null
  status: FlightStatus
  created_at: string
}

export interface SeatRequest {
  id: string
  flight_id: string
  user_id: string
  seats_needed: number
  notes: string | null
  created_at: string
}
