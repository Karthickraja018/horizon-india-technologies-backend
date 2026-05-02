import { createClient } from '@supabase/supabase-js'

let _client: ReturnType<typeof createClient> | null = null

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
}

export function getSupabaseClient() {
  if (_client) return _client

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl) throw new Error('Missing SUPABASE_URL')
  if (!supabaseKey) throw new Error('Missing SUPABASE_KEY')

  _client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  return _client
}

