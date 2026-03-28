import { create } from 'zustand'
import { membres as initialMembres, type Membre } from '@/data/membres'
import { supabase, type BirraRow, type HistorialRow } from '@/lib/supabase'

type DayLog = {
  date: string
  count: number
}

type MembreState = Membre & {
  birresAvui: number
  cubatesAvui: number
  historial: DayLog[]
}

type BirraStore = {
  membres: MembreState[]
  isLoaded: boolean
  initialize: () => () => void
  addBirra: (membreId: string) => Promise<void>
  removeBirra: (membreId: string) => Promise<void>
  addCubata: (membreId: string) => Promise<void>
  removeCubata: (membreId: string) => Promise<void>
  resetAvui: () => Promise<void>
  resetTotal: () => Promise<void>
  getTodayTotal: () => number
  getTodayCubatesTotal: () => number
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

const baseState: MembreState[] = initialMembres.map((m) => ({
  ...m,
  birresAvui: 0,
  cubatesAvui: 0,
  historial: [],
}))

export const useBirraStore = create<BirraStore>()((set, get) => ({
  membres: baseState,
  isLoaded: false,

  initialize: () => {
    const today = getTodayKey()

    const fetchData = async () => {
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

      if (birresResult.status === 'fulfilled' && birresResult.value.error)
        console.error('[beBirra] Error llegint birres:', birresResult.value.error.message)
      if (historialResult.status === 'fulfilled' && historialResult.value.error)
        console.error('[beBirra] Error llegint historial:', historialResult.value.error.message)

      set((state) => ({
        isLoaded: true,
        membres: state.membres.map((m) => {
          const row = birresData?.find((r) => r.membre_id === m.id)
          const isToday = row?.avui_date === today
          const memberHistorial = (historialData ?? [])
            .filter((h) => h.membre_id === m.id)
            .map((h) => ({ date: h.data, count: h.count }))
          return {
            ...m,
            birresTotal: row?.birres_total ?? 0,
            birresAvui: isToday ? (row?.birres_avui ?? 0) : 0,
            cubatesTotal: row?.cubates_total ?? 0,
            cubatesAvui: isToday ? (row?.cubates_avui ?? 0) : 0,
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'birres' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new as BirraRow
          const today = getTodayKey()
          const isToday = row.avui_date === today
          set((state) => ({
            membres: state.membres.map((m) => {
              if (m.id !== row.membre_id) return m
              return {
                ...m,
                birresTotal: row.birres_total,
                birresAvui: isToday ? row.birres_avui : 0,
                cubatesTotal: row.cubates_total,
                cubatesAvui: isToday ? row.cubates_avui : 0,
              }
            }),
          }))
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('[beBirra] Realtime connectat ✓')
      })

    return () => { supabase.removeChannel(channel) }
  },

  addBirra: async (membreId) => {
    const today = getTodayKey()
    const membre = get().membres.find((m) => m.id === membreId)
    if (!membre) return

    const todayHistorial = membre.historial.find((h) => h.date === today)
    const newAvui = membre.birresAvui + 1
    const newTotal = membre.birresTotal + 1

    set((s) => ({
      membres: s.membres.map((m) => {
        if (m.id !== membreId) return m
        const historial = todayHistorial
          ? m.historial.map((h) => h.date === today ? { ...h, count: h.count + 1 } : h)
          : [...m.historial, { date: today, count: 1 }]
        return { ...m, birresAvui: newAvui, birresTotal: newTotal, historial }
      }),
    }))

    const { error } = await supabase.from('birres').upsert(
      { membre_id: membreId, birres_total: newTotal, birres_avui: newAvui, cubates_total: membre.cubatesTotal, cubates_avui: membre.cubatesAvui, avui_date: today },
      { onConflict: 'membre_id' }
    )
    if (error) console.error('[beBirra] Error guardant birra:', error.message)

    const { error: hErr } = await supabase.from('historial').upsert(
      { membre_id: membreId, data: today, count: (todayHistorial?.count ?? 0) + 1 },
      { onConflict: 'membre_id,data' }
    )
    if (hErr) console.error('[beBirra] Error guardant historial:', hErr.message)
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
        return {
          ...m,
          birresAvui: newAvui,
          birresTotal: newTotal,
          historial: m.historial.map((h) => h.date === today ? { ...h, count: Math.max(0, h.count - 1) } : h),
        }
      }),
    }))

    const { error } = await supabase.from('birres').upsert(
      { membre_id: membreId, birres_total: newTotal, birres_avui: newAvui, cubates_total: membre.cubatesTotal, cubates_avui: membre.cubatesAvui, avui_date: today },
      { onConflict: 'membre_id' }
    )
    if (error) console.error('[beBirra] Error traient birra:', error.message)

    const { error: hErr } = await supabase.from('historial').upsert(
      { membre_id: membreId, data: today, count: todayCount },
      { onConflict: 'membre_id,data' }
    )
    if (hErr) console.error('[beBirra] Error actualitzant historial:', hErr.message)
  },

  addCubata: async (membreId) => {
    const today = getTodayKey()
    const membre = get().membres.find((m) => m.id === membreId)
    if (!membre) return

    const newAvui = membre.cubatesAvui + 1
    const newTotal = membre.cubatesTotal + 1

    set((s) => ({
      membres: s.membres.map((m) =>
        m.id !== membreId ? m : { ...m, cubatesAvui: newAvui, cubatesTotal: newTotal }
      ),
    }))

    const { error } = await supabase.from('birres').upsert(
      { membre_id: membreId, birres_total: membre.birresTotal, birres_avui: membre.birresAvui, cubates_total: newTotal, cubates_avui: newAvui, avui_date: today },
      { onConflict: 'membre_id' }
    )
    if (error) console.error('[beBirra] Error guardant cubata:', error.message)
  },

  removeCubata: async (membreId) => {
    const today = getTodayKey()
    const membre = get().membres.find((m) => m.id === membreId)
    if (!membre || membre.cubatesAvui <= 0) return

    const newAvui = membre.cubatesAvui - 1
    const newTotal = Math.max(0, membre.cubatesTotal - 1)

    set((s) => ({
      membres: s.membres.map((m) =>
        m.id !== membreId ? m : { ...m, cubatesAvui: newAvui, cubatesTotal: newTotal }
      ),
    }))

    const { error } = await supabase.from('birres').upsert(
      { membre_id: membreId, birres_total: membre.birresTotal, birres_avui: membre.birresAvui, cubates_total: newTotal, cubates_avui: newAvui, avui_date: today },
      { onConflict: 'membre_id' }
    )
    if (error) console.error('[beBirra] Error traient cubata:', error.message)
  },

  resetAvui: async () => {
    const today = getTodayKey()
    set((s) => ({
      membres: s.membres.map((m) => ({ ...m, birresAvui: 0, cubatesAvui: 0 })),
    }))
    const { error } = await supabase.from('birres').upsert(
      get().membres.map((m) => ({
        membre_id: m.id,
        birres_total: m.birresTotal,
        birres_avui: 0,
        cubates_total: m.cubatesTotal,
        cubates_avui: 0,
        avui_date: today,
      })),
      { onConflict: 'membre_id' }
    )
    if (error) console.error('[beBirra] Error reset avui:', error.message)
  },

  resetTotal: async () => {
    const today = getTodayKey()
    set((s) => ({
      membres: s.membres.map((m) => ({ ...m, birresAvui: 0, birresTotal: 0, cubatesAvui: 0, cubatesTotal: 0, historial: [] })),
    }))
    const { error: bErr } = await supabase.from('birres').upsert(
      get().membres.map((m) => ({
        membre_id: m.id,
        birres_total: 0,
        birres_avui: 0,
        cubates_total: 0,
        cubates_avui: 0,
        avui_date: today,
      })),
      { onConflict: 'membre_id' }
    )
    if (bErr) console.error('[beBirra] Error reset total:', bErr.message)

    const { error: hErr } = await supabase.from('historial').delete().not('membre_id', 'is', null)
    if (hErr) console.error('[beBirra] Error esborrant historial:', hErr.message)
  },

  getTodayTotal: () => get().membres.reduce((sum, m) => sum + m.birresAvui, 0),
  getTodayCubatesTotal: () => get().membres.reduce((sum, m) => sum + m.cubatesAvui, 0),
}))
