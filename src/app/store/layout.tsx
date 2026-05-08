'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Menu, X } from 'lucide-react'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [storeName, setStoreName] = useState('')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const getStore = async () => {
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
    await supabase.auth.signOut()
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
        className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
          isActive
            ? 'bg-orange-500 text-white'
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
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden bg-white shadow p-4 flex items-center justify-between">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-gray-700">
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-orange-500">QuincaDZ – {t('dashboard')}</span>
        <div className="w-8" />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform lg:relative lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-orange-500">QuincaDZ</h2>
          <p className="text-sm text-gray-600 mt-1">{storeName || t('dashboard')}</p>
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
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100"
              >
                <LogOut size={20} />
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
