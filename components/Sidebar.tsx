'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useBirraStore } from '@/store/birraStore'
import Avatar from './Avatar'
import type { Membre } from '@/data/membres'

type MembreWithState = Membre & {
  birresAvui: number
  historial: { date: string; count: number }[]
}

export default function Sidebar() {
  const { membres } = useBirraStore()
  const [isOpen, setIsOpen] = useState(false)

  const totalAvui = membres.reduce((s, m) => s + m.birresAvui, 0)

  return (
    <>
      {/* Mobile hamburger toggle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer lg:hidden"
        aria-label="Obrir menú"
      >
        <div className="flex flex-col gap-1.5 w-5">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block h-px bg-amber-400 origin-center"
          />
          <motion.span
            animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            className="block h-px bg-amber-400"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block h-px bg-amber-400 origin-center"
          />
        </div>
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* The actual sidebar */}
      <aside
        className={[
          // Mobile: fixed, slides in/out via translate
          'fixed top-0 bottom-0 left-0 w-[260px] z-40',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible fixed sidebar
          'lg:translate-x-0',
          'flex flex-col border-r border-white/8 overflow-hidden',
        ].join(' ')}
        style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(24px)' }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 border-b border-white/8 flex-shrink-0">
          <Link href="/" onClick={() => setIsOpen(false)} className="block">
            <h2 className="font-display text-3xl text-amber-400 tracking-tight hover:text-amber-300 transition-colors leading-none">
              beBirra
            </h2>
            <p className="text-white/25 text-xs mt-1 tracking-widest uppercase">Lliures de Sabadell</p>
          </Link>
        </div>

        {/* Members list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {membres.map((m, i) => (
            <SidebarMember key={m.id} membre={m} index={i} onClose={() => setIsOpen(false)} />
          ))}
        </nav>

        {/* Footer stats */}
        <div className="px-5 py-4 border-t border-white/8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-white/25 text-xs uppercase tracking-widest">Grup avui</span>
            <motion.span
              key={totalAvui}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-amber-400 font-display text-2xl"
            >
              {totalAvui}
            </motion.span>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarMember({
  membre,
  index,
  onClose,
}: {
  membre: MembreWithState
  index: number
  onClose: () => void
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <Link href={`/membres/${membre.id}`} onClick={onClose} className="block">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02, duration: 0.35 }}
        className="relative flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer group hover:bg-white/5 transition-colors"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        {/* Left accent on hover */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 rounded-full group-hover:h-4 transition-all duration-200"
          style={{ background: membre.color }}
        />

        {/* Avatar flip */}
        <div className="relative flex-shrink-0 w-9 h-9" style={{ perspective: '200px' }}>
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 220, damping: 22 }}
            style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%', position: 'relative' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Avatar src={membre.imatge} alt={membre.nom} color={membre.color} size={36} className="rounded-lg overflow-hidden" />
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-lg flex items-center justify-center font-display font-bold text-sm"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: `linear-gradient(135deg, ${membre.color}44, ${membre.color}22)`,
                color: membre.color,
              }}
            >
              {membre.nom[0]}
            </div>
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white/65 text-sm truncate group-hover:text-white/90 transition-colors leading-tight">
            {membre.alias[0] ?? membre.nom.split(' ')[0]}
          </p>
          {membre.alias.length > 0 && (
            <p className="text-white/25 text-[10px] truncate leading-tight">{membre.nom.split(' ')[0]}</p>
          )}
        </div>

        {/* Today badge */}
        <AnimatePresence>
          {membre.birresAvui > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: `${membre.color}22`, color: membre.color }}
            >
              {membre.birresAvui}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}
