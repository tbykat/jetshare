import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser / client-side: read-only queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side only: mutations that bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
