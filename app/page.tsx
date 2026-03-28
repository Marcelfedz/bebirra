'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import HeroSection from '@/components/HeroSection'
import MemberCard from '@/components/MemberCard'
import BirraChart from '@/components/BirraChart'
import { membres } from '@/data/membres'
import { useBirraStore } from '@/store/birraStore'

export default function Home() {
  const { membres: membreState, resetAvui, resetTotal, getTodayTotal, getTodayCubatesTotal } = useBirraStore()
  const todayTotal = getTodayTotal()
  const todayCubatesTotal = getTodayCubatesTotal()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleResetTotal = () => {
    if (confirmReset) {
      resetTotal()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Dashboard content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20 max-w-6xl mx-auto">

        {/* Stats ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 rounded-2xl border border-white/8 p-5 flex flex-wrap gap-6 items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(0,0,0,0.4))' }}
        >
          <div className="flex gap-8">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Birres avui</p>
              <motion.p
                key={todayTotal}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-display text-5xl text-amber-400"
              >
                {todayTotal}
              </motion.p>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Cubates avui</p>
              <motion.p
                key={todayCubatesTotal}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-display text-5xl"
                style={{ color: '#a78bfa' }}
              >
                {todayCubatesTotal}
              </motion.p>
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Membres</p>
              <p className="font-display text-3xl text-white/70">{membres.length}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Bevedors avui</p>
              <p className="font-display text-3xl text-white/70">
                {membreState.filter((m) => m.birresAvui > 0 || m.cubatesAvui > 0).length}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resetAvui}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/40 text-sm hover:border-red-500/40 hover:text-red-400 transition-colors cursor-pointer"
            >
              Reset avui
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleResetTotal}
              animate={confirmReset ? { borderColor: 'rgba(239,68,68,0.6)', color: 'rgb(239,68,68)' } : {}}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/30 text-sm hover:border-red-500/40 hover:text-red-400 transition-colors cursor-pointer"
            >
              {confirmReset ? '⚠ Confirmar reset total' : 'Reset total'}
            </motion.button>
          </div>
        </motion.div>

        {/* Chart section */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-amber-400" />
            <h2 className="font-display text-2xl text-white/80 tracking-wider">Rànquing Total</h2>
          </div>

          <div
            className="rounded-2xl border border-white/8 p-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <BirraChart />
          </div>
        </motion.section>

        {/* Members grid */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-amber-400" />
            <h2 className="font-display text-2xl text-white/80 tracking-wider">Els Lliures</h2>
            <span className="text-white/30 text-sm font-body ml-1">{membres.length} membres</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {membres.map((m, i) => (
              <MemberCard
                key={m.id}
                index={i}
                id={m.id}
                nom={m.nom}
                alias={m.alias}
                descripcio={m.descripcio}
                imatge={m.imatge}
                color={m.color}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
