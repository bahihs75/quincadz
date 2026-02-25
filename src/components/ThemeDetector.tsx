'use client'

import { useEffect } from 'react'

export default function ThemeDetector() {
  useEffect(() => {
    // Check if OS is in dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    // Initial check
    updateTheme(mediaQuery)
    // Listen for changes
    mediaQuery.addEventListener('change', updateTheme)
    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [])
  return null
}
