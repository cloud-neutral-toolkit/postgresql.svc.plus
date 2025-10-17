'use client'
import { useLanguage } from '../i18n/LanguageProvider'
import { translations } from '../i18n/translations'

export default function Contact() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section id="contact" className="py-20 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">{t.contactTitle}</h2>
        <p className="text-xl">manbuzhe2008@gmail.com</p>
      </div>
    </section>
  )
}
