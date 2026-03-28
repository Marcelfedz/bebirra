'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Bubble = {
  id: number
  x: number
  size: number
  duration: number
  delay: number
}

function BeerBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }))
    setBubbles(generated)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full border border-amber-400/30 bg-amber-400/10"
          style={{
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight : 900) - 40],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1, 1.2],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 })

  const rotateX = useTransform(springY, [-300, 300], [12, -12])
  const rotateY = useTransform(springX, [-300, 300], [-12, 12])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    mouseX.set(e.clientX - cx)
    mouseY.set(e.clientY - cy)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Amber radial glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-orange-600/8 blur-[80px]" />
      </div>

      <BeerBubbles />

      {/* 3D tilt title */}
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 text-center"
        style={{ perspective: '800px' }}
      >
        <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}>
          {/* Subtitle above */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-amber-400/70 tracking-[0.35em] text-sm font-medium mb-4 uppercase"
          >
            Els Lliures de Sabadell
          </motion.p>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, type: 'spring', bounce: 0.3 }}
            className="font-display text-[clamp(5rem,15vw,11rem)] leading-none tracking-tight"
          >
            <span
              className="block text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #F5A623 0%, #FFD166 40%, #D4A017 70%, #F5A623 100%)',
                filter: 'drop-shadow(0 0 40px rgba(245,166,35,0.4))',
              }}
            >
              be
            </span>
            <span
              className="block text-transparent bg-clip-text -mt-4"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFFBF0 0%, #F5F0E8 50%, #D4A017 100%)',
                filter: 'drop-shadow(0 0 60px rgba(255,255,255,0.15))',
              }}
            >
              Birra
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 text-white/50 text-lg font-body tracking-wide max-w-md mx-auto"
          >
            Comptador oficial de birres del grup més lliure de Sabadell.
            <br />
            <span className="text-amber-400/60 text-sm">Beu responsablement. O no.</span>
          </motion.p>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative z-10 mt-12 flex gap-8 text-center"
      >
        {[
          { label: 'membres', value: '17' },
          { label: 'reputació', value: '∞' },
          { label: 'penediments', value: '0' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="font-display text-3xl text-amber-400">{stat.value}</span>
            <span className="text-white/40 text-xs tracking-widest uppercase mt-1">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-amber-400/40 to-transparent"
        />
      </motion.div>
    </section>
  )
}
