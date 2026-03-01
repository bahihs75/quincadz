'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { LayoutDashboard, Package, ShoppingBag, Settings, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
    toast.success(t('logout_success'))
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
      <div className="lg:hidden bg-white dark:bg-gray-900 shadow p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-gray-700 dark:text-gray-300">
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="font-bold text-primary dark:text-primary">QuincaDZ – {t('dashboard')}</span>
        <LanguageSwitcher />
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
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{storeName || t('dashboard')}</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <LanguageSwitcher />
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
                className="Btn w-full flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <div className="sign">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                  </svg>
                </div>
                <span className="text">{t('logout')}</span>
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
