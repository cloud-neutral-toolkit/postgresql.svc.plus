'use client'

import { Copy } from 'lucide-react'

interface Props {
  text: string
}

export default function CopyButton({ text }: Props) {
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (e) {
      console.error('copy failed', e)
    }
  }
  return (
    <button
      onClick={handleClick}
      className="h-8 w-8 rounded border flex items-center justify-center hover:bg-gray-100"
      title="Copy"
    >
      <Copy className="w-4 h-4" />
    </button>
  )
}
