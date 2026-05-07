'use client'

import Link from 'next/link'
import { usePathname, useRouter } from '/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
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
  const { t } = useLanguage()
  const [userName, setUserName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
            ? 'bg-primary text-white'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon size={20} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header with menu button */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="QuincaDZ" className="h-6 w-auto" />
          <span className="font-bold text-primary">QuincaDZ</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar – fixed on desktop, slide‑out on mobile */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-slate-200 shadow-lg z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QuincaDZ" className="h-6 w-auto" />
            <span className="text-xl font-bold text-primary">QuincaDZ</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200">
          <p className="text-sm text-slate-500">Admin</p>
          <p className="font-medium text-slate-800">{userName || t('admin_dashboard')}</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
            <li className="pt-4 mt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-700 transition hover:bg-slate-100"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content – automatically offset by sidebar width on desktop */}
      <main className="lg:mr-64 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
