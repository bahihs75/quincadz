'use client'

import { useEffect, useState } from 'react'

export default function ClientGuard({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  if (!isClient) {
    return null // or a loading spinner
  }
  return <>{children}</>
}
