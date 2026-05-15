import { createClient } from '@supabase/supabase-js'

const VITE_URL = import.meta.env.VITE_SUPABASE_URL     || ''
const VITE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Also try localStorage (set via SetupPage)
const LS_URL   = typeof localStorage !== 'undefined' ? (localStorage.getItem('sb_url') || '') : ''
const LS_KEY   = typeof localStorage !== 'undefined' ? (localStorage.getItem('sb_key') || '') : ''

const SUPABASE_URL      = VITE_URL || LS_URL
const SUPABASE_ANON_KEY = VITE_KEY || LS_KEY

export const isConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
