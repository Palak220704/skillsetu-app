import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fgfvxmwhplhwkgyivdcd.supabase.co'
const supabaseAnonKey = 'sb_publishable_Vn9RIyLOr_fRcyZZP7jRiw_WcJ5gzKX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)