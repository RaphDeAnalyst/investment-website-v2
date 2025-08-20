// lib/supabase.ts (Fixed version)
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Singleton pattern to ensure we only create one client
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const createSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log('🔄 Creating new Supabase client...')
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully')
  }
  return supabaseInstance
}

// Profile type with all required fields

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  wallet_address_btc: string | null
  wallet_address_usdt_bep20: string | null  // Updated
  wallet_address_usdt_erc20: string | null  // Updated
  profile_complete: boolean | null
  phone_number: string | null
  country: string | null
  created_at: string
  updated_at: string
}

// Export default client for convenience
export const supabase = createSupabaseClient()