// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// These env vars are prefixed with NEXT_PUBLIC_, so they're exposed to the browser:
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
