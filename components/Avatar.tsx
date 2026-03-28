'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  src: string
  alt: string
  color: string
  size?: number
  className?: string
  onImageLoad?: (hasImage: boolean) => void // called with false on error
}

export default function Avatar({ src, alt, color, size = 64, className = '', onImageLoad }: Props) {
  const [error, setError] = useState(false)

  const handleError = () => {
    setError(true)
    onImageLoad?.(false)
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center font-display font-bold ${className}`}
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${color}44, ${color}11)`,
          color,
          fontSize: size * 0.42,
        }}
      >
        {alt[0]}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        onError={handleError}
      />
    </div>
  )
}
