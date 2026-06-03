// Departure FBOs — edit to add/remove departure airports
export const DEPARTURE_FBOS = [
  'KPDK — DeKalb-Peachtree (Chamblee)',
  'KATL — Hartsfield-Jackson Atlanta',
  'KFTY — Fulton County Airport',
  'KVPC — Cartersville Airport',
  'KLZU — Gwinnett County Airport',
] as const

// Arrival FBOs — edit to add/remove destination airports
export const ARRIVAL_FBOS = [
  'MYAM — Marsh Harbour',
  'MYES — Staniel Cay',
  'MYEF — George Town (Exuma)',
] as const

export type DepartureFBO = (typeof DEPARTURE_FBOS)[number]
export type ArrivalFBO = (typeof ARRIVAL_FBOS)[number]
