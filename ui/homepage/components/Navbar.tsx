'use client'
import Image from 'next/image'
import { useState } from 'react'
import demoFeature from '../app/demo/feature.config'
import docsFeature from '../app/docs/feature.config'
import cloudIacFeature from '../app/cloud_iac/feature.config'
import loginFeature from '../app/login/feature.config'
import registerFeature from '../app/register/feature.config'
import { useLanguage } from '../i18n/LanguageProvider'
import { translations } from '../i18n/translations'
import LanguageToggle from './LanguageToggle'
import type { FeatureFlag } from '@lib/featureFlags'

type NavSubItem = {
  key: string
  label: string
  href: string
  feature?: FeatureFlag
}

type NavItem = {
  key: string
  label: string
  children: NavSubItem[]
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const { language } = useLanguage()
  const nav = translations[language].nav

  const navItems: NavItem[] = [
    {
      key: 'openSource',
      label: nav.openSource.title,
      children: [
        {
          key: 'features',
          label: nav.openSource.features,
          href: '#features',
        },
        {
          key: 'projects',
          label: nav.openSource.projects,
          href: '#open-sources',
        },
        {
          key: 'download',
          label: nav.openSource.download,
          href: '#download',
        },
      ],
    },
    {
      key: 'services',
      label: nav.services.title,
      children: [
        {
          key: 'artifact',
          label: nav.services.artifact,
          href: '/download',
        },
        {
          key: 'cloudIac',
          label: nav.services.cloudIac,
          href: '/cloud_iac',
          feature: cloudIacFeature,
        },
        {
          key: 'insight',
          label: nav.services.insight,
          href: '/insight',
        },
        {
          key: 'docs',
          label: nav.services.docs,
          href: '/docs',
          feature: docsFeature,
        },
      ],
    },
    {
      key: 'account',
      label: nav.account.title,
      children: [
        {
          key: 'register',
          label: nav.account.register,
          href: '/register',
          feature: registerFeature,
        },
        {
          key: 'login',
          label: nav.account.login,
          href: '/login',
          feature: loginFeature,
        },
        {
          key: 'demo',
          label: nav.account.demo,
          href: '/demo',
          feature: demoFeature,
        },
      ],
    },
  ]

  const visibleNavItems: NavItem[] = navItems
    .map((item) => ({
      ...item,
      children: item.children.filter((child) => child.feature?.defaultEnabled !== false),
    }))
    .filter((item) => item.children.length > 0)

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Image
            src="/icons/cloudnative_32.png"
            alt="logo"
            width={24}
            height={24}
            className="h-6 w-6"
            unoptimized
          />
          CloudNative Suite
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-900">
          {visibleNavItems.map((item) => {
            const dropdownPosition = item.key === 'account' ? 'right-0' : 'left-0'
            return (
              <div key={item.key} className="relative group">
                <button
                  className={`hover:text-purple-600 ${
                    activeMenu === item.key ? 'text-purple-600' : ''
                  }`}
                >
                  {item.label}
                </button>
                <div
                  className={`absolute ${dropdownPosition} top-full pt-2 opacity-0 translate-y-1 transform transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto`}
                >
                  <div className="bg-white rounded-md shadow-lg border border-gray-200 py-2">
                    {item.children.map((child) => {
                      const isExternal = child.href.startsWith('http')
                      return (
                        <a
                          key={child.key}
                          href={child.href}
                          className={`block px-4 py-2 hover:bg-gray-100 whitespace-nowrap ${
                            activeItem === child.key ? 'text-purple-600' : ''
                          }`}
                          onClick={() => {
                            setActiveMenu(item.key)
                            setActiveItem(child.key)
                          }}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                        >
                          {child.label}
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
          <LanguageToggle />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center text-gray-900 focus:outline-none"
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
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-gray-200 px-4 pb-4">
          {visibleNavItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => toggleSection(item.key)}
                className={`w-full flex justify-between items-center py-2 text-gray-900 ${
                  openSection === item.key || activeMenu === item.key ? 'text-purple-600' : ''
                }`}
              >
                <span>{item.label}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    openSection === item.key ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === item.key && (
                <div className="pl-4">
                  {item.children.map((child) => {
                    const isExternal = child.href.startsWith('http')
                    return (
                      <a
                        key={child.key}
                        href={child.href}
                        onClick={() => {
                          setMenuOpen(false)
                          setActiveMenu(item.key)
                          setActiveItem(child.key)
                        }}
                        className={`block py-1 text-gray-900 hover:text-purple-600 ${
                          activeItem === child.key ? 'text-purple-600' : ''
                        }`}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {child.label}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          <div className="pt-2">
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  )
}

