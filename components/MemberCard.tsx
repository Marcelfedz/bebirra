'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import BirraCounter from './BirraCounter'
import Avatar from './Avatar'
import { useBirraStore } from '@/store/birraStore'

type Props = {
  id: string
  nom: string
  alias: string[]
  descripcio: string
  imatge: string
  color: string
  index: number
}

export default function MemberCard({ id, nom, alias, descripcio, imatge, color, index }: Props) {
  const { membres } = useBirraStore()
  const membre = membres.find((m) => m.id === id)

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -30, y: 40 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.6,
        delay: (index % 4) * 0.08,
        type: 'spring',
        stiffness: 100,
        damping: 18,
      }}
      style={{ transformStyle: 'preserve-3d', perspective: '600px' }}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative rounded-2xl overflow-hidden border border-white/8 cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.3) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Color accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        <div className="p-5 flex gap-4 items-start">
          {/* Avatar */}
          <Link href={`/membres/${id}`} className="flex-shrink-0">
            <div
              className="rounded-xl overflow-hidden transition-shadow duration-300"
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px ${color}, 0 0 20px ${color}40`
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <Avatar src={imatge} alt={nom} color={color} size={64} className="rounded-xl overflow-hidden" />
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/membres/${id}`}>
              <h3 className="font-display text-lg text-white/90 leading-tight hover:text-amber-400 transition-colors">
                {nom}
              </h3>
            </Link>

            {alias.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {alias.map((a) => (
                  <span
                    key={a}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${color}18`,
                      color: color,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}

            <p className="text-white/40 text-xs mt-2 leading-relaxed line-clamp-2">{descripcio}</p>

            {/* Total birres */}
            <div className="mt-2 flex items-center gap-1">
              <span className="text-white/25 text-xs">total:</span>
              <span className="text-xs font-semibold" style={{ color: `${color}cc` }}>
                {membre?.birresTotal ?? 0} birres
              </span>
            </div>
          </div>
        </div>

        {/* Counter section */}
        <div
          className="px-5 pb-5 pt-2 border-t border-white/5"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-xs uppercase tracking-wider">Avui</span>
            <BirraCounter membreId={id} membreColor={color} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
