'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useBirraStore } from '@/store/birraStore'

type Props = {
  membreId: string
  membreColor: string
}

function BeerGlass({ fill, color }: { fill: number; color: string }) {
  const fillPercent = Math.min(100, Math.max(0, fill * 12.5)) // 8 birres = full

  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Glass outline */}
      <path
        d="M6 4 L4 40 L32 40 L30 4 Z"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Handle */}
      <path
        d="M30 12 Q38 12 38 20 Q38 28 30 28"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Beer fill - clip to glass shape */}
      <clipPath id={`glass-clip-${color.replace('#', '')}`}>
        <path d="M6.5 4.5 L4.5 39.5 L31.5 39.5 L29.5 4.5 Z" />
      </clipPath>
      <rect
        x="4"
        y={40 - (35 * fillPercent) / 100}
        width="28"
        height={(35 * fillPercent) / 100}
        fill={color}
        opacity="0.75"
        clipPath={`url(#glass-clip-${color.replace('#', '')})`}
        style={{ transition: 'all 0.4s ease' }}
      />
      {/* Foam */}
      {fillPercent > 5 && (
        <ellipse
          cx="18"
          cy={40 - (35 * fillPercent) / 100}
          rx="12"
          ry="3"
          fill="rgba(255,255,255,0.85)"
          clipPath={`url(#glass-clip-${color.replace('#', '')})`}
        />
      )}
      {/* Top rim */}
      <rect x="4" y="3" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />
    </svg>
  )
}

export default function BirraCounter({ membreId, membreColor }: Props) {
  const { membres, addBirra, removeBirra } = useBirraStore()
  const membre = membres.find((m) => m.id === membreId)
  const [bounce, setBounce] = useState(false)

  const handleAdd = useCallback(() => {
    addBirra(membreId)
    setBounce(true)
    setTimeout(() => setBounce(false), 400)
  }, [addBirra, membreId])

  if (!membre) return null

  return (
    <div className="flex items-center gap-3">
      {/* Beer glass visual */}
      <motion.div
        animate={bounce ? { scale: [1, 1.2, 0.95, 1], rotate: [0, -8, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <BeerGlass fill={membre.birresAvui} color={membreColor} />
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={membre.birresAvui}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="font-display text-2xl leading-none"
            style={{ color: membreColor }}
          >
            {membre.birresAvui}
          </motion.span>
        </AnimatePresence>

        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleAdd}
            className="w-7 h-7 rounded-md flex items-center justify-center text-black font-bold text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: membreColor }}
            aria-label="Afegir birra"
          >
            +
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => removeBirra(membreId)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 font-bold text-sm cursor-pointer bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            aria-label="Treure birra"
          >
            −
          </motion.button>
        </div>
      </div>
    </div>
  )
}
