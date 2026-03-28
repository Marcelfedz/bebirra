'use client'

import { motion } from 'framer-motion'
import { useBirraStore } from '@/store/birraStore'

export default function BirraChart() {
  const { membres } = useBirraStore()

  const sorted = [...membres]
    .filter((m) => m.birresTotal > 0)
    .sort((a, b) => b.birresTotal - a.birresTotal)
    .slice(0, 10)

  const maxVal = sorted[0]?.birresTotal ?? 1

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/20">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M12 8L10 40H38L36 8H12Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M36 16Q44 16 44 24Q44 32 36 32" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
        </svg>
        <p className="mt-3 text-sm">Encara cap birra registrada. A beure!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sorted.map((m, i) => (
        <div key={m.id} className="flex items-center gap-3">
          {/* Rank */}
          <span
            className="text-xs font-bold w-5 text-right flex-shrink-0"
            style={{ color: i === 0 ? '#F5A623' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.25)' }}
          >
            {i + 1}
          </span>

          {/* Name */}
          <span className="text-white/60 text-xs w-28 truncate flex-shrink-0">
            {m.alias[0] ?? m.nom.split(' ')[0]}
          </span>

          {/* Bar */}
          <div className="flex-1 relative h-6 flex items-center">
            <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-white/5" />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${(m.birresTotal / maxVal) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
              style={{
                background: `linear-gradient(90deg, ${m.color}88, ${m.color})`,
                boxShadow: `0 0 12px ${m.color}40`,
              }}
            />
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 + 0.6 }}
              className="absolute right-2 text-xs font-bold text-white/80 mix-blend-plus-lighter"
            >
              {m.birresTotal}
            </motion.span>
          </div>
        </div>
      ))}
    </div>
  )
}
