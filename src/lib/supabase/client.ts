import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export const createClient = () => {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return browserClient
}
