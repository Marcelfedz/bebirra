'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { membres } from '@/data/membres'
import { useBirraStore } from '@/store/birraStore'
import BirraCounter from '@/components/BirraCounter'
import Avatar from '@/components/Avatar'

export default function MemberPage() {
  const params = useParams()
  const slug = params?.slug as string
  const membre = membres.find((m) => m.id === slug)

  if (!membre) return notFound()

  return <MemberProfile membre={membre} />
}

function ImageLightbox({
  src,
  alt,
  color,
  onClose,
}: {
  src: string
  alt: string
  color: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

        {/* Image container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="relative z-10 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full aspect-square rounded-3xl overflow-hidden"
            style={{ boxShadow: `0 0 0 2px ${color}60, 0 0 80px ${color}30` }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 384px"
              priority
            />
          </div>

          {/* Name label */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mt-4 font-display text-2xl tracking-wider"
            style={{ color }}
          >
            {alt}
          </motion.p>
        </motion.div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          aria-label="Tancar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

function MemberProfile({ membre }: { membre: (typeof membres)[0] }) {
  const { membres: membreState } = useBirraStore()
  const state = membreState.find((m) => m.id === membre.id)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [hasImage, setHasImage] = useState(true)

  const handleAvatarError = () => setHasImage(false)

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const entry = state?.historial.find((h) => h.date === key)
    return {
      date: key,
      label: d.toLocaleDateString('ca', { weekday: 'short' }),
      count: entry?.count ?? 0,
    }
  })

  const maxCount = Math.max(...last7.map((d) => d.count), 1)

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      {/* Lightbox */}
      {lightboxOpen && hasImage && (
        <ImageLightbox
          src={membre.imatge}
          alt={membre.nom}
          color={membre.color}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/30 hover:text-amber-400 transition-colors text-sm mb-8 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tornar
        </Link>
      </motion.div>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl border border-white/8 overflow-hidden mb-6"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.5))' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${membre.color}, transparent)` }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: membre.color }}
        />

        <div className="relative p-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          {/* Avatar — clickable if image exists */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 18 }}
            className="relative flex-shrink-0"
          >
            <motion.button
              whileHover={hasImage ? { scale: 1.05 } : {}}
              whileTap={hasImage ? { scale: 0.97 } : {}}
              onClick={() => hasImage && setLightboxOpen(true)}
              className={`relative w-28 h-28 rounded-2xl overflow-hidden block group/avatar ${hasImage ? 'cursor-zoom-in' : 'cursor-default'}`}
              style={{ boxShadow: `0 0 0 3px ${membre.color}40, 0 0 40px ${membre.color}30` }}
              aria-label={hasImage ? `Veure foto de ${membre.nom} en gran` : membre.nom}
            >
              <Avatar
                src={membre.imatge}
                alt={membre.nom}
                color={membre.color}
                size={112}
                className="rounded-2xl overflow-hidden"
                onImageLoad={(ok) => { if (!ok) handleAvatarError() }}
              />

              {/* Zoom hint overlay */}
              {hasImage && (
                <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
                  <svg className="opacity-0 group-hover/avatar:opacity-100 transition-opacity drop-shadow-lg" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="1.5" />
                    <path d="M16.5 16.5L21 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M11 8V14M8 11H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </motion.button>
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-4xl sm:text-5xl text-white/95 mb-2">{membre.nom}</h1>

            {membre.alias.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {membre.alias.map((a) => (
                  <span
                    key={a}
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{
                      background: `${membre.color}18`,
                      color: membre.color,
                      border: `1px solid ${membre.color}35`,
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}

            <p className="text-white/55 leading-relaxed max-w-md">{membre.descripcio}</p>
          </div>

          {/* Total badge */}
          <div className="flex flex-col items-center">
            <span className="text-white/25 text-xs uppercase tracking-widest mb-1">Total birres</span>
            <span className="font-display text-5xl" style={{ color: membre.color }}>
              {state?.birresTotal ?? 0}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Today counter */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-white/8 p-6 mb-6 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${membre.color}08, rgba(0,0,0,0.4))` }}
      >
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Avui</p>
          <p className="text-white/60 text-sm">
            {state?.birresAvui === 0
              ? 'Encara res... de moment'
              : state?.birresAvui === 1
              ? '1 birra al cos'
              : `${state?.birresAvui} birres al cos`}
          </p>
        </div>
        <BirraCounter membreId={membre.id} membreColor={membre.color} />
      </motion.div>

      {/* 7-day chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/8 p-6"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <h2 className="font-display text-xl text-white/70 tracking-wider mb-5">Últims 7 dies</h2>

        <div className="flex items-end gap-3 h-32">
          {last7.map((day, i) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full rounded-t-lg relative"
                initial={{ height: 0 }}
                animate={{ height: `${(day.count / maxCount) * 100}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                style={{
                  background: day.count > 0
                    ? `linear-gradient(180deg, ${membre.color}, ${membre.color}55)`
                    : 'rgba(255,255,255,0.05)',
                  minHeight: '4px',
                  boxShadow: day.count > 0 ? `0 -4px 12px ${membre.color}40` : 'none',
                }}
              >
                {day.count > 0 && (
                  <span
                    className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold"
                    style={{ color: membre.color }}
                  >
                    {day.count}
                  </span>
                )}
              </motion.div>
              <span className="text-white/25 text-xs capitalize">{day.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
