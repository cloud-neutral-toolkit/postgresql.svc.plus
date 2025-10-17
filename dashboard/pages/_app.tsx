'use client'

import type { AppProps } from 'next/app'

import '../app/globals.css'
import { AppProviders } from '../app/AppProviders'

export default function HomepageApp({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  )
}
