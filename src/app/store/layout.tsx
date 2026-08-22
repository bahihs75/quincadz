'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = isSupabaseConfigured ? createClient() : null
  const { t } = useLanguage()
  const [storeName, setStoreName] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const getStore = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('stores')
          .select('store_name')
          .eq('user_id', user.id)
          .single()
        if (data) setStoreName(data.store_name)
      }
    }
    getStore()
  }, [supabase])

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/store', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/store/products', label: t('products_management'), icon: Package },
    { href: '/store/orders', label: t('orders_management'), icon: ShoppingBag },
    { href: '/store/settings', label: t('store_settings'), icon: Settings },
  ]

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 transition duration-200 ${
          isActive
            ? 'bg-[#F5C400] text-[#111111] shadow-[0_8px_18px_rgba(245,196,0,0.18)]'
            : 'text-[#777777] hover:bg-[#F5F2EA] hover:text-[#111111]'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F2EA]">
      <div className="flex items-center justify-between border-b border-[#D8D4CB] bg-[#F5F2EA] p-4 lg:hidden">
        <button type="button" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} aria-label={mobileSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'} className="icon-button">
          {mobileSidebarOpen ? <X size={19} strokeWidth={1.8} aria-hidden="true" /> : <Menu size={19} strokeWidth={1.8} aria-hidden="true" />}
        </button>
        <span className="font-extrabold text-[#111111]">Quinca<span className="text-[#F5C400]">DZ</span></span>
        <div className="w-11" />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-[#111111]/60 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-64 transform border-l border-[#D8D4CB] bg-[#FFFFFF] shadow-[0_24px_64px_rgba(17,17,17,0.12)] transition-transform duration-200 lg:relative lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="border-b border-[#D8D4CB] p-6">
          <h2 className="text-xl font-extrabold text-[#111111]">QuincaDZ</h2>
          <p className="mt-1 text-sm text-[#777777]">{storeName || t('dashboard')}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
            <li className="mt-4 border-t border-[#D8D4CB] pt-4">
              <button
                onClick={handleLogout}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-[#777777] transition hover:bg-[#F5F2EA] hover:text-[#111111]"
              >
                <LogOut size={20} strokeWidth={1.8} aria-hidden="true" />
                <span>{t('logout')}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
