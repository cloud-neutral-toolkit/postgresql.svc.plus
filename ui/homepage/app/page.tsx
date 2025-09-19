export const dynamic = 'error'

import Hero from '@components/Hero'
import Features from '@components/Features'
import OpenSource from '@components/OpenSource'
import DownloadSection from '@components/DownloadSection'
import Terms from '@components/Terms'
import Contact from '@components/Contact'
import Footer from '@components/Footer'
import Navbar from '@components/Navbar'
import { AskAIButton } from '@components/AskAIButton'

export default function HomePage() {
  return (
    <>
        <Navbar />
      <main className="pt-24">
        <Hero />
        <Features />
        <OpenSource />
        <DownloadSection />
        <Terms />
        <Contact />
      </main>
      <Footer />
      <AskAIButton />
    </>
  )
}
