import { create } from 'zustand'
import { membres as initialMembres, type Membre } from '@/data/membres'
import { supabase, type BirraRow, type HistorialRow } from '@/lib/supabase'

type DayLog = {
  date: string
  count: number
}

type MembreState = Membre & {
  birresAvui: number
  historial: DayLog[]
}

type BirraStore = {
  membres: MembreState[]
  isLoaded: boolean
  initialize: () => () => void
  addBirra: (membreId: string) => Promise<void>
  removeBirra: (membreId: string) => Promise<void>
  resetAvui: () => Promise<void>
  resetTotal: () => Promise<void>
  getTodayTotal: () => number
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

const baseState: MembreState[] = initialMembres.map((m) => ({
  ...m,
  birresAvui: 0,
  historial: [],
}))

export const useBirraStore = create<BirraStore>()((set, get) => ({
  membres: baseState,
  isLoaded: false,

  initialize: () => {
    const today = getTodayKey()

    const fetchData = async () => {
      // Use allSettled so one failure doesn't block the other
      const [birresResult, historialResult] = await Promise.allSettled([
        supabase.from('birres').select('*'),
        supabase.from('historial').select('*'),
      ])

      const birresData =
        birresResult.status === 'fulfilled' && !birresResult.value.error
          ? (birresResult.value.data as BirraRow[])
          : null

      const historialData =
        historialResult.status === 'fulfilled' && !historialResult.value.error
          ? (historialResult.value.data as HistorialRow[])
          : null

      if (birresResult.status === 'fulfilled' && birresResult.value.error) {
        console.error('[beBirra] Error llegint birres:', birresResult.value.error.message)
      }
      if (historialResult.status === 'fulfilled' && historialResult.value.error) {
        console.error('[beBirra] Error llegint historial:', historialResult.value.error.message)
      }

      set((state) => ({
        isLoaded: true,
        membres: state.membres.map((m) => {
          const row = birresData?.find((r) => r.membre_id === m.id)
          const memberHistorial = (historialData ?? [])
            .filter((h) => h.membre_id === m.id)
            .map((h) => ({ date: h.data, count: h.count }))
          return {
            ...m,
            birresTotal: row?.birres_total ?? 0,
            birresAvui: row?.avui_date === today ? (row.birres_avui ?? 0) : 0,
            historial: memberHistorial,
          }
        }),
      }))
    }

    fetchData().catch((err) => {
      console.error('[beBirra] Error inicialitzant:', err)
      set({ isLoaded: true })
    })

    const channel = supabase
      .channel('birres-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'birres' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as BirraRow
            const today = getTodayKey()
            set((state) => ({
              membres: state.membres.map((m) => {
                if (m.id !== row.membre_id) return m
                return {
                  ...m,
                  birresTotal: row.birres_total,
                  birresAvui: row.avui_date === today ? row.birres_avui : 0,
                }
              }),
            }))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[beBirra] Realtime connectat ✓')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  },

  addBirra: async (membreId) => {
    const today = getTodayKey()
    const membre = get().membres.find((m) => m.id === membreId)
    if (!membre) return

    const todayHistorial = membre.historial.find((h) => h.date === today)
    const newAvui = membre.birresAvui + 1
    const newTotal = membre.birresTotal + 1
    const newHistorialCount = (todayHistorial?.count ?? 0) + 1

    // Optimistic update — UI responds immediately
    set((s) => ({
      membres: s.membres.map((m) => {
        if (m.id !== membreId) return m
        const historial = todayHistorial
          ? m.historial.map((h) => h.date === today ? { ...h, count: h.count + 1 } : h)
          : [...m.historial, { date: today, count: 1 }]
        return { ...m, birresAvui: newAvui, birresTotal: newTotal, historial }
      }),
    }))

    // Save to Supabase
    const { error: birresError } = await supabase.from('birres').upsert(
      { membre_id: membreId, birres_total: newTotal, birres_avui: newAvui, avui_date: today },
      { onConflict: 'membre_id' }
    )
    if (birresError) console.error('[beBirra] Error guardant birra:', birresError.message)

    const { error: historialError } = await supabase.from('historial').upsert(
      { membre_id: membreId, data: today, count: newHistorialCount },
      { onConflict: 'membre_id,data' }
    )
    if (historialError) console.error('[beBirra] Error guardant historial:', historialError.message)
  },

  removeBirra: async (membreId) => {
    const today = getTodayKey()
    const membre = get().membres.find((m) => m.id === membreId)
    if (!membre || membre.birresAvui <= 0) return

    const newAvui = membre.birresAvui - 1
    const newTotal = Math.max(0, membre.birresTotal - 1)
    const todayCount = Math.max(0, (membre.historial.find((h) => h.date === today)?.count ?? 0) - 1)

    set((s) => ({
      membres: s.membres.map((m) => {
        if (m.id !== membreId) return m
        const historial = m.historial.map((h) =>
          h.date === today ? { ...h, count: Math.max(0, h.count - 1) } : h
        )
        return { ...m, birresAvui: newAvui, birresTotal: newTotal, historial }
      }),
    }))

    const { error: birresError } = await supabase.from('birres').upsert(
      { membre_id: membreId, birres_total: newTotal, birres_avui: newAvui, avui_date: today },
      { onConflict: 'membre_id' }
    )
    if (birresError) console.error('[beBirra] Error traient birra:', birresError.message)

    const { error: historialError } = await supabase.from('historial').upsert(
      { membre_id: membreId, data: today, count: todayCount },
      { onConflict: 'membre_id,data' }
    )
    if (historialError) console.error('[beBirra] Error actualitzant historial:', historialError.message)
  },

  resetAvui: async () => {
    const today = getTodayKey()
    set((s) => ({
      membres: s.membres.map((m) => ({ ...m, birresAvui: 0 })),
    }))
    const { error } = await supabase.from('birres').upsert(
      get().membres.map((m) => ({
        membre_id: m.id,
        birres_total: m.birresTotal,
        birres_avui: 0,
        avui_date: today,
      })),
      { onConflict: 'membre_id' }
    )
    if (error) console.error('[beBirra] Error reset avui:', error.message)
  },

  resetTotal: async () => {
    const today = getTodayKey()
    set((s) => ({
      membres: s.membres.map((m) => ({ ...m, birresAvui: 0, birresTotal: 0, historial: [] })),
    }))
    const { error: birresError } = await supabase.from('birres').upsert(
      get().membres.map((m) => ({
        membre_id: m.id,
        birres_total: 0,
        birres_avui: 0,
        avui_date: today,
      })),
      { onConflict: 'membre_id' }
    )
    if (birresError) console.error('[beBirra] Error reset total:', birresError.message)

    const { error: historialError } = await supabase
      .from('historial')
      .delete()
      .not('membre_id', 'is', null)
    if (historialError) console.error('[beBirra] Error esborrant historial:', historialError.message)
  },

  getTodayTotal: () => {
    return get().membres.reduce((sum, m) => sum + m.birresAvui, 0)
  },
}))
