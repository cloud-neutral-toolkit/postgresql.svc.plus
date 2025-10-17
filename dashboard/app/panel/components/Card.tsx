import type { ReactNode } from 'react'

export default function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur">
      {children}
    </section>
  )
}
