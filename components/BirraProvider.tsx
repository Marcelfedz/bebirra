'use client'

import { useEffect } from 'react'
import { useBirraStore } from '@/store/birraStore'

export default function BirraProvider({ children }: { children: React.ReactNode }) {
  const initialize = useBirraStore((s) => s.initialize)

  useEffect(() => {
    const cleanup = initialize()
    return cleanup
  }, [initialize])

  return <>{children}</>
}
