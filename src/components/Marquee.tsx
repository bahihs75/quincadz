'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  className?: string
  children: React.ReactNode
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
}

export function Marquee({
  className,
  children,
  direction = 'left',
  pauseOnHover = false,
}: MarqueeProps) {
  return (
    <div className={cn(
      "overflow-hidden relative w-full",
      className
    )}>
      <div
        className={cn(
          "flex whitespace-nowrap",
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
