'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { 
  LayoutDashboard, Store, Users, Tag, Settings, LogOut, Menu, X, Package
} from 'lucide-react'

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
        const { data } = await supabase.from('users').select('full_name').eq('id', user.id).single()
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
      <Link href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
        <Icon size={20} /> <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <button onClick={() => setSidebarOpen(true)} className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md lg:hidden">
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-primary">QuincaDZ</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500"><X size={20} /></button>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-slate-600">{userName || t('admin_dashboard')}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map(item => <li key={item.href}><NavLink item={item} /></li>)}
            <li className="pt-4 mt-4 border-t"><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-700 hover:bg-slate-100"><LogOut size={20} /> {t('logout')}</button></li>
          </ul>
        </nav>
        <div className="p-4 border-t mt-auto"><LanguageSwitcher /></div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
