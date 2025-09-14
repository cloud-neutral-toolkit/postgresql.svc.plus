'use client'

import { useEffect } from 'react'

export function useReadingProgress(key: string) {
  useEffect(() => {
    const saved = localStorage.getItem(`progress:${key}`)
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10))
    }
    const handler = () => {
      localStorage.setItem(`progress:${key}`, String(window.scrollY))
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [key])
}
