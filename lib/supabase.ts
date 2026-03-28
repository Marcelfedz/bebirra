import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type BirraRow = {
  membre_id: string
  birres_total: number
  birres_avui: number
  cubates_total: number
  cubates_avui: number
  avui_date: string
}

export type HistorialRow = {
  membre_id: string
  data: string
  count: number
}
