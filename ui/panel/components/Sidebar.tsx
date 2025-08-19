import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Server, Code, CreditCard, Search, User } from 'lucide-react'

export interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/agent', label: 'Agent', icon: Server },
  { href: '/api', label: 'API', icon: Code },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/xray', label: 'XRay', icon: Search },
  { href: '/account', label: 'Account', icon: User },
]

export default function Sidebar({ className = '', onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav className={`w-64 bg-gray-100 p-4 space-y-2 ${className}`}>
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
            pathname === item.href ? 'bg-gray-300 font-semibold' : ''
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
