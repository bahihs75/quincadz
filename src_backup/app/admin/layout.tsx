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
        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
          isActive
            ? 'bg-primary text-white dark:bg-secondary'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 shadow dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-gray-700 dark:text-gray-300">
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="QuincaDZ" className="h-6 w-auto" />
          <span className="font-bold text-primary dark:text-primary">QuincaDZ – {t('admin_dashboard')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
              <Globe size={20} />
            </button>
            <div className="absolute left-0 z-50 mt-2 hidden w-40 rounded-lg border border-gray-200 bg-white shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
              <button onClick={() => setLanguage('ar')} className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'ar' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>العربية</button>
              <button onClick={() => setLanguage('fr')} className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'fr' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Français</button>
              <button onClick={() => setLanguage('en')} className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'en' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>English</button>
            </div>
          </div>
        </div>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 transform border-l border-gray-200 bg-white shadow-lg transition-transform lg:relative lg:translate-x-0 dark:border-gray-800 dark:bg-gray-900 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QuincaDZ" className="h-6 w-auto" />
            <div>
              <h2 className="text-xl font-bold text-primary dark:text-primary">QuincaDZ</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{userName || t('admin_dashboard')}</p>
            </div>
          </div>
          <div className="relative hidden group lg:block">
            <button className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
              <Globe size={20} />
            </button>
            <div className="absolute right-0 z-50 mt-2 hidden w-40 rounded-lg border border-gray-200 bg-white shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
              <button onClick={() => setLanguage('ar')} className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'ar' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>العربية</button>
              <button onClick={() => setLanguage('fr')} className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'fr' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Français</button>
              <button onClick={() => setLanguage('en')} className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'en' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'}`}>English</button>
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
            <li className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="lg:mr-64 p-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
