import type { ReactNode } from 'react'

import Footer from '@components/Footer'
import Navbar from '@components/Navbar'
import { AskAIButton } from '@components/AskAIButton'

import type { CmsExtension } from '../types'

function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <AskAIButton />
    </>
  )
}

export const appShellExtension: CmsExtension = {
  name: 'app-shell',
  Layout: AppShellLayout,
}
