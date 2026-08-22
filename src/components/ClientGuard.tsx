'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function ClientGuard({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  if (!isClient) {
    return <div aria-hidden="true" className="min-h-[100dvh] bg-[#f7f6f3]" />
  }

  return <>{children}</>
}
