'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useBirraStore } from '@/store/birraStore'

type DrinkType = 'birra' | 'cubata'

type Props = {
  membreId: string
  membreColor: string
  type?: DrinkType
}

function BeerGlass({ fill, color }: { fill: number; color: string }) {
  const fillPercent = Math.min(100, Math.max(0, fill * 12.5))
  const id = `beer-${color.replace('#', '')}`
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
      <path d="M6 4 L4 40 L32 40 L30 4 Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <path d="M30 12 Q38 12 38 20 Q38 28 30 28" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
      <clipPath id={id}><path d="M6.5 4.5 L4.5 39.5 L31.5 39.5 L29.5 4.5 Z" /></clipPath>
      <rect x="4" y={40 - (35 * fillPercent) / 100} width="28" height={(35 * fillPercent) / 100}
        fill={color} opacity="0.75" clipPath={`url(#${id})`} style={{ transition: 'all 0.4s ease' }} />
      {fillPercent > 5 && (
        <ellipse cx="18" cy={40 - (35 * fillPercent) / 100} rx="12" ry="3"
          fill="rgba(255,255,255,0.85)" clipPath={`url(#${id})`} />
      )}
      <rect x="4" y="3" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />
    </svg>
  )
}

function CoctailGlass({ fill, color }: { fill: number; color: string }) {
  const fillPercent = Math.min(100, Math.max(0, fill * 20)) // 5 cubates = full
  const id = `cubata-${color.replace('#', '')}`
  // Triangle glass: top wide (x: 4-32), bottom narrow (x: 16-20), stem at 18
  const glassTop = 4
  const glassMid = 38 // where the V tip is
  const fillY = glassMid - (34 * fillPercent) / 100
  return (
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
      {/* Glass outline - V shape */}
      <path d="M4 4 L18 38 L32 4 Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* Stem */}
      <line x1="18" y1="38" x2="18" y2="44" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* Base */}
      <line x1="12" y1="44" x2="24" y2="44" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Fill clip */}
      <clipPath id={id}><path d="M4.5 4 L18 37.5 L31.5 4 Z" /></clipPath>
      {fillPercent > 0 && (
        <>
          {/* Liquid fill */}
          <rect x="0" y={fillY} width="36" height={glassMid - fillY}
            fill={color} opacity="0.7" clipPath={`url(#${id})`} style={{ transition: 'all 0.4s ease' }} />
          {/* Surface line */}
          <rect x="0" y={fillY} width="36" height="2"
            fill="rgba(255,255,255,0.5)" clipPath={`url(#${id})`} />
        </>
      )}
      {/* Rim */}
      <line x1="4" y1="4" x2="32" y2="4" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
      {/* Olive / straw */}
      {fillPercent > 15 && (
        <circle cx="22" cy={fillY + 3} r="2.5" fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      )}
    </svg>
  )
}

export default function BirraCounter({ membreId, membreColor, type = 'birra' }: Props) {
  const { membres, addBirra, removeBirra, addCubata, removeCubata } = useBirraStore()
  const membre = membres.find((m) => m.id === membreId)
  const [bounce, setBounce] = useState(false)

  const isCubata = type === 'cubata'
  const count = isCubata ? (membre?.cubatesAvui ?? 0) : (membre?.birresAvui ?? 0)

  const handleAdd = useCallback(() => {
    if (isCubata) addCubata(membreId)
    else addBirra(membreId)
    setBounce(true)
    setTimeout(() => setBounce(false), 400)
  }, [isCubata, addCubata, addBirra, membreId])

  const handleRemove = useCallback(() => {
    if (isCubata) removeCubata(membreId)
    else removeBirra(membreId)
  }, [isCubata, removeCubata, removeBirra, membreId])

  if (!membre) return null

  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={bounce ? { scale: [1, 1.2, 0.95, 1], rotate: [0, -8, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {isCubata
          ? <CoctailGlass fill={count} color={membreColor} />
          : <BeerGlass fill={count} color={membreColor} />
        }
      </motion.div>

      <div className="flex flex-col gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="font-display text-2xl leading-none"
            style={{ color: membreColor }}
          >
            {count}
          </motion.span>
        </AnimatePresence>

        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleAdd}
            className="w-7 h-7 rounded-md flex items-center justify-center text-black font-bold text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: membreColor }}
            aria-label={isCubata ? 'Afegir cubata' : 'Afegir birra'}
          >
            +
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleRemove}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 font-bold text-sm cursor-pointer bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            aria-label={isCubata ? 'Treure cubata' : 'Treure birra'}
          >
            −
          </motion.button>
        </div>
      </div>
    </div>
  )
}
