'use client'

import { Copy } from 'lucide-react'
import { copyText } from '../utils/copy'
import { Button } from './ui/button'

interface Props {
  text: string
}

export default function CopyButton({ text }: Props) {
  return (
    <Button variant="outline" size="icon" onClick={() => copyText(text)}>
      <Copy className="w-4 h-4" />
    </Button>
  )
}
