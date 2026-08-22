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
      <Link href={item.href} onClick={() => setSidebarOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 transition duration-200 ${isActive ? 'bg-[#F5C400] text-[#111111] shadow-[0_8px_18px_rgba(245,196,0,0.18)]' : 'text-[#777777] hover:bg-[#F5F2EA] hover:text-[#111111]'}`}>
        <Icon size={20} /> <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <button type="button" onClick={() => setSidebarOpen(true)} aria-label="فتح القائمة" className="icon-button fixed left-4 top-4 z-50 lg:hidden">
        <Menu size={19} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 transform border-l border-[#D8D4CB] bg-[#FFFFFF] shadow-[0_24px_64px_rgba(17,17,17,0.12)] transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#D8D4CB] p-4">
          <h2 className="text-xl font-extrabold text-[#111111]">Quinca<span className="text-[#F5C400]">DZ</span></h2>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة" className="icon-button lg:hidden"><X size={18} strokeWidth={1.8} aria-hidden="true" /></button>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-slate-600">{userName || t('admin_dashboard')}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map(item => <li key={item.href}><NavLink item={item} /></li>)}
            <li className="mt-4 border-t border-[#D8D4CB] pt-4"><button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-[#777777] transition hover:bg-[#F5F2EA] hover:text-[#111111]"><LogOut size={20} strokeWidth={1.8} aria-hidden="true" /> {t('logout')}</button></li>
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
