'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useBirraStore } from '@/store/birraStore'

type DrinkType = 'birra' | 'cubata'

function RankingList({ type }: { type: DrinkType }) {
  const { membres } = useBirraStore()
  const isCubata = type === 'cubata'

  const sorted = [...membres]
    .filter((m) => (isCubata ? m.cubatesTotal : m.birresTotal) > 0)
    .sort((a, b) =>
      (isCubata ? b.cubatesTotal - a.cubatesTotal : b.birresTotal - a.birresTotal)
    )
    .slice(0, 10)

  const maxVal = (isCubata ? sorted[0]?.cubatesTotal : sorted[0]?.birresTotal) ?? 1

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/20">
        <p className="text-sm">
          {isCubata ? 'Encara cap cubata registrada. A cubar-se!' : 'Encara cap birra registrada. A beure!'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((m, i) => {
        const val = isCubata ? m.cubatesTotal : m.birresTotal
        return (
          <div key={m.id} className="flex items-center gap-3">
            <span
              className="text-xs font-bold w-5 text-right flex-shrink-0"
              style={{ color: i === 0 ? '#F5A623' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.25)' }}
            >
              {i + 1}
            </span>
            <span className="text-white/60 text-xs w-28 truncate flex-shrink-0">
              {m.alias[0] ?? m.nom.split(' ')[0]}
            </span>
            <div className="flex-1 relative h-6 flex items-center">
              <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-white/5" />
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(val / maxVal) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
                  boxShadow: `0 0 12px ${m.color}40`,
                }}
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 + 0.6 }}
                className="absolute right-2 text-xs font-bold text-white/80 mix-blend-plus-lighter"
              >
                {val}
              </motion.span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BirraChart() {
  const [tab, setTab] = useState<DrinkType>('birra')

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-2 mb-5">
        {(['birra', 'cubata'] as DrinkType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={
              tab === t
                ? { background: 'rgba(245,166,35,0.15)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {t === 'birra' ? 'Birres' : 'Cubates'}
          </button>
        ))}
      </div>

      <RankingList key={tab} type={tab} />
    </div>
  )
}
