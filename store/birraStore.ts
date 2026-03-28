import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { membres as initialMembres, type Membre } from '@/data/membres'

type DayLog = {
  date: string // ISO date string YYYY-MM-DD
  count: number
}

type MembreState = Membre & {
  birresAvui: number
  historial: DayLog[]
}

type BirraStore = {
  membres: MembreState[]
  addBirra: (membreId: string) => void
  removeBirra: (membreId: string) => void
  resetAvui: () => void
  resetTotal: () => void
  getTodayTotal: () => number
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

const initialState: MembreState[] = initialMembres.map((m) => ({
  ...m,
  birresAvui: 0,
  historial: [],
}))

export const useBirraStore = create<BirraStore>()(
  persist(
    (set, get) => ({
      membres: initialState,

      addBirra: (membreId) => {
        const today = getTodayKey()
        set((state) => ({
          membres: state.membres.map((m) => {
            if (m.id !== membreId) return m
            const existing = m.historial.find((h) => h.date === today)
            const historial = existing
              ? m.historial.map((h) =>
                  h.date === today ? { ...h, count: h.count + 1 } : h
                )
              : [...m.historial, { date: today, count: 1 }]
            return {
              ...m,
              birresAvui: m.birresAvui + 1,
              birresTotal: m.birresTotal + 1,
              historial,
            }
          }),
        }))
      },

      removeBirra: (membreId) => {
        const today = getTodayKey()
        set((state) => ({
          membres: state.membres.map((m) => {
            if (m.id !== membreId) return m
            if (m.birresAvui <= 0) return m
            const historial = m.historial.map((h) =>
              h.date === today && h.count > 0
                ? { ...h, count: h.count - 1 }
                : h
            )
            return {
              ...m,
              birresAvui: Math.max(0, m.birresAvui - 1),
              birresTotal: Math.max(0, m.birresTotal - 1),
              historial,
            }
          }),
        }))
      },

      resetAvui: () => {
        set((state) => ({
          membres: state.membres.map((m) => ({ ...m, birresAvui: 0 })),
        }))
      },

      resetTotal: () => {
        set((state) => ({
          membres: state.membres.map((m) => ({
            ...m,
            birresAvui: 0,
            birresTotal: 0,
            historial: [],
          })),
        }))
      },

      getTodayTotal: () => {
        return get().membres.reduce((sum, m) => sum + m.birresAvui, 0)
      },
    }),
    {
      name: 'bebirra-storage',
    }
  )
)
