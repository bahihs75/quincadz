'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Tag, 
  Settings, 
  LogOut,
  Menu,
  X,
  Globe,
  Package
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t, language, setLanguage } = useLanguage()
  const [userName, setUserName] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (data) setUserName(data.full_name)
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/admin', label: t('admin_dashboard'), icon: LayoutDashboard },
    { href: '/admin/stores', label: t('stores_management'), icon: Store },
    { href: '/admin/users', label: t('users_management'), icon: Users },
    { href: '/admin/categories', label: t('categories_management'), icon: Tag },
    { href: '/admin/products', label: t('products_management'), icon: Package },
    { href: '/admin/settings', label: t('platform_settings'), icon: Settings },
  ]

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden bg-white shadow p-4 flex items-center justify-between">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-blue-600">QuincaDZ – {t('admin_dashboard')}</span>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="p-2 text-gray-600 hover:text-blue-600">
              <Globe size={20} />
            </button>
            <div className="absolute left-0 mt-2 w-40 bg-white border rounded-lg shadow-lg hidden group-hover:block">
              <button onClick={() => setLanguage('ar')} className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${language === 'ar' ? 'bg-blue-50 text-blue-600' : ''}`}>العربية</button>
              <button onClick={() => setLanguage('fr')} className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${language === 'fr' ? 'bg-blue-50 text-blue-600' : ''}`}>Français</button>
              <button onClick={() => setLanguage('en')} className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${language === 'en' ? 'bg-blue-50 text-blue-600' : ''}`}>English</button>
            </div>
          </div>
        </div>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-blue-600">QuincaDZ</h2>
            <p className="text-sm text-gray-600 mt-1">{userName || t('admin_dashboard')}</p>
          </div>
          <div className="relative group hidden lg:block">
            <button className="p-2 text-gray-600 hover:text-blue-600">
              <Globe size={20} />
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg hidden group-hover:block">
              <button onClick={() => setLanguage('ar')} className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${language === 'ar' ? 'bg-blue-50 text-blue-600' : ''}`}>العربية</button>
              <button onClick={() => setLanguage('fr')} className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${language === 'fr' ? 'bg-blue-50 text-blue-600' : ''}`}>Français</button>
              <button onClick={() => setLanguage('en')} className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${language === 'en' ? 'bg-blue-50 text-blue-600' : ''}`}>English</button>
            </div>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
            <li className="pt-4 mt-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="lg:mr-64 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
