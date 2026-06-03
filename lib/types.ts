export type FlightStatus = 'available' | 'requested'

export interface Flight {
  id: string
  owner_name: string
  owner_contact: string
  departure_fbo: string
  arrival_fbo: string
  departure_date: string   // ISO date string YYYY-MM-DD
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
  requester_name: string
  requester_contact: string
  seats_needed: number
  created_at: string
}
