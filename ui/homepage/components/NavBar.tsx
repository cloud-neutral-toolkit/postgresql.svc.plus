'use client'
import { useState } from 'react'
import LanguageToggle from './LanguageToggle'
import { useLanguage } from '../i18n/LanguageProvider'
import { translations } from '../i18n/translations'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { language } = useLanguage()
  const nav = translations[language].nav

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-white flex items-center gap-2">
          <img src="/icons/cloudnative_32.png" alt="logo" className="w-6 h-6" />
          CloudNative Suite
        </a>

        {/* 桌面导航 */}
        <div className="hidden md:flex items-center gap-6 text-sm text-white">
          <a href="#features" className="hover:text-purple-300">{nav.features}</a>
          <a href="#open-sources" className="hover:text-purple-300">{nav.openSource}</a>
          <a href="#download" className="hover:text-purple-300">{nav.download}</a>
          <a href="#contact" className="hover:text-purple-300">{nav.contact}</a>
          <a href="/login" className="hover:text-purple-300">{nav.login}</a>
          <a href="/register" className="hover:text-purple-300">{nav.register}</a>
          <LanguageToggle />
        </div>

        {/* 移动端汉堡菜单按钮 */}
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
              // 关闭图标 (X)
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              // 汉堡图标
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 移动端菜单内容，展开时显示 */}
      {menuOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur border-t border-white/10 px-4 pb-4">
          <a
            href="#features"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-white hover:text-purple-300"
          >
            {nav.features}
          </a>
          <a
            href="#open-sources"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-white hover:text-purple-300"
          >
            {nav.openSource}
          </a>
          <a
            href="#download"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-white hover:text-purple-300"
          >
            {nav.download}
          </a>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-white hover:text-purple-300"
          >
            {nav.contact}
          </a>
          <a
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-white hover:text-purple-300"
          >
            {nav.login}
          </a>
          <a
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-white hover:text-purple-300"
          >
            {nav.register}
          </a>
          <div className="pt-2">
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  )
}