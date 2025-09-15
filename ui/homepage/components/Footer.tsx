'use client'
import { useLanguage } from '../i18n/LanguageProvider'
import { translations } from '../i18n/translations'

export default function Footer() {
  const { language } = useLanguage()
  const t = translations[language].footerLinks

  return (
    <footer className="bg-gray-100 text-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-6 text-sm">
          <a href="#privacy" className="hover:text-purple-600">{t[0]}</a>
          <a href="#terms" className="hover:text-purple-600">{t[1]}</a>
          <a href="#contact" className="hover:text-purple-600">{t[2]}</a>
        </div>
        <div className="flex gap-4 text-xl">
          <a href="#" title="Twitter">🐦</a>
          <a href="#" title="Email">📧</a>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-6">
        © 2025 CloudNative Suite. All rights reserved.
      </div>
    </footer>
  )
}
