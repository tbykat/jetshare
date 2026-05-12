// Edit this list to match your community's actual departure airports
export const DEPARTURE_LOCATIONS = [
  'Miami Executive Airport (TMB)',
  'Fort Lauderdale Executive Airport (FXE)',
  'Palm Beach International (PBI)',
  'Naples Airport (APF)',
  'Opa-Locka Executive Airport (OPF)',
] as const

export type DepartureLocation = (typeof DEPARTURE_LOCATIONS)[number]
