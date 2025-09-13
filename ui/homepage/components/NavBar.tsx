'use client'
import { useState } from 'react'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from '../i18n/LanguageProvider'
import { translations } from '../i18n/translations'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const { language } = useLanguage()
  const nav = translations[language].nav

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-white flex items-center gap-2">
          <img src="/icons/cloudnative_32.png" alt="logo" className="w-6 h-6" />
          CloudNative Suite
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white">
          {/* Open Source */}
          <div className="relative group">
            <button className="hover:text-purple-300">{nav.openSource.title}</button>
            <div className="absolute left-0 mt-2 hidden group-hover:block bg-black/80 backdrop-blur rounded-md shadow-lg border border-white/10 py-2">
              <a href="#features" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.openSource.features}
              </a>
              <a
                href="https://github.com/XProxyTeam/XControl"
                className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap"
              >
                {nav.openSource.code}
              </a>
              <a href="#download" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.openSource.download}
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="relative group">
            <button className="hover:text-purple-300">{nav.services.title}</button>
            <div className="absolute left-0 mt-2 hidden group-hover:block bg-black/80 backdrop-blur rounded-md shadow-lg border border-white/10 py-2">
              <a href="#" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.services.artifact}
              </a>
              <a href="/docs" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.services.docs}
              </a>
            </div>
          </div>

          {/* Account */}
          <div className="relative group">
            <button className="hover:text-purple-300">{nav.account.title}</button>
            <div className="absolute right-0 mt-2 hidden group-hover:block bg-black/80 backdrop-blur rounded-md shadow-lg border border-white/10 py-2">
              <a href="/register" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.account.register}
              </a>
              <a href="/login" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.account.login}
              </a>
              <a href="/demo" className="block px-4 py-2 hover:bg-white/10 whitespace-nowrap">
                {nav.account.demo}
              </a>
            </div>
          </div>

          <LanguageToggle />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur border-t border-white/10 px-4 pb-4">
          {/* Open Source */}
          <div>
            <button
              onClick={() => toggleSection('openSource')}
              className="w-full flex justify-between items-center py-2 text-white"
            >
              <span>{nav.openSource.title}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  openSection === 'openSource' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'openSource' && (
              <div className="pl-4">
                <a
                  href="#features"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.openSource.features}
                </a>
                <a
                  href="https://github.com/XProxyTeam/XControl"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.openSource.code}
                </a>
                <a
                  href="#download"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.openSource.download}
                </a>
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <button
              onClick={() => toggleSection('services')}
              className="w-full flex justify-between items-center py-2 text-white"
            >
              <span>{nav.services.title}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  openSection === 'services' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'services' && (
              <div className="pl-4">
                <a
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.services.artifact}
                </a>
                <a
                  href="/docs"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.services.docs}
                </a>
              </div>
            )}
          </div>

          {/* Account */}
          <div>
            <button
              onClick={() => toggleSection('account')}
              className="w-full flex justify-between items-center py-2 text-white"
            >
              <span>{nav.account.title}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  openSection === 'account' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'account' && (
              <div className="pl-4">
                <a
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.account.register}
                </a>
                <a
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.account.login}
                </a>
                <a
                  href="/demo"
                  onClick={() => setMenuOpen(false)}
                  className="block py-1 text-white hover:text-purple-300"
                >
                  {nav.account.demo}
                </a>
              </div>
            )}
          </div>

          <div className="pt-2">
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  )
}

