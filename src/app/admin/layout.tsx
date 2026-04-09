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
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { language, setLanguage, t } = useLanguage()
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
    toast.success(t('logout_success'))
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
            ? 'bg-primary text-white '
            : 'text-slate-700 hover:bg-slate-100  dark:hover:bg-gray-800'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 ">
      <div className="lg:hidden bg-white  shadow p-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-800">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-slate-700 ">
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-primary ">QuincaDZ – {t('admin_dashboard')}</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'ar'|'fr'|'en')}
          className="bg-slate-100  border border-slate-300 dark:border-gray-700 text-slate-900  text-sm rounded-lg p-1"
        >
          <option value="ar">AR</option>
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 transform border-l border-slate-200 bg-white shadow-lg transition-transform lg:relative lg:translate-x-0 dark:border-gray-800  ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QuincaDZ" className="h-6 w-auto" />
            <div>
              <h2 className="text-xl font-bold text-primary ">QuincaDZ</h2>
              <p className="mt-1 text-sm text-slate-600 ">{userName || t('admin_dashboard')}</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'ar'|'fr'|'en')}
              className="bg-slate-100  border border-slate-300 dark:border-gray-700 text-slate-900  text-sm rounded-lg p-1"
            >
              <option value="ar">AR</option>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
            <li className="mt-4 border-t border-slate-200 pt-4 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-700 transition hover:bg-slate-100  dark:hover:bg-gray-800"
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
