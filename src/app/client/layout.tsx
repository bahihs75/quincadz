'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import CartSidebar from '@/components/client/CartSidebar'
import LocationPicker from '@/components/LocationPicker'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { ShoppingCart, Menu, X, User, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { getItemCount, openCart, closeCart } = useCart()
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const saved = localStorage.getItem('quincadz_location')
    if (saved) {
      setUserLocation(JSON.parse(saved))
    } else {
      setShowLocationPicker(true)
    }
  }, [supabase])

  const handleLocationSelect = (loc: any) => {
    setUserLocation(loc)
    localStorage.setItem('quincadz_location', JSON.stringify(loc))
    setShowLocationPicker(false)
  }

  const handleLinkClick = () => {
    closeCart()
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success(t('logout_success'))
    router.push('/')
  }

  const navItems = [
    { href: '/client', label: t('home') },
    { href: '/client/products', label: t('products') },
    { href: '/client/orders', label: t('orders') },
    { href: '/client/profile', label: t('profile') },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="QuincaDZ" className="h-8 w-auto" />
              <Link href="/client" onClick={handleLinkClick} className="text-2xl font-bold text-primary dark:text-primary">
                QuincaDZ
              </Link>
            </div>

            <nav className="hidden space-x-6 space-x-reverse md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-primary text-white dark:bg-secondary'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              {userLocation && (
                <div className="hidden items-center text-sm text-gray-600 dark:text-gray-400 md:flex">
                  <MapPin size={16} className="ml-1" />
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="underline hover:text-primary dark:hover:text-primary"
                  >
                    {userLocation.wilaya_name} - {userLocation.baladiya_name}
                  </button>
                </div>
              )}

              <button
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <ShoppingCart size={20} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="Btn group"
                  aria-label="Logout"
                >
                  <div className="sign">
                    <svg viewBox="0 0 512 512">
                      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                    </svg>
                  </div>
                  <div className="text">Logout</div>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={handleLinkClick}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-secondary dark:bg-primary dark:hover:bg-secondary"
                >
                  {t('login')}
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-400 md:hidden"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {userLocation && (
            <div className="flex items-center justify-center border-t border-gray-200 py-2 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400 md:hidden">
              <MapPin size={14} className="ml-1" />
              <button
                onClick={() => setShowLocationPicker(true)}
                className="underline hover:text-primary dark:hover:text-primary"
              >
                {userLocation.wilaya_name} - {userLocation.baladiya_name}
              </button>
            </div>
          )}

          {mobileMenuOpen && (
            <nav className="border-t border-gray-200 py-4 dark:border-gray-800 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-primary text-white dark:bg-secondary'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                  onClick={handleLinkClick}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 dark:bg-opacity-70">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-black dark:text-white">{t('choose_location')}</h3>
              <button onClick={() => setShowLocationPicker(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={userLocation}
              />
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen">
        {children}
      </main>

      <CartSidebar />
    </>
  )
}
