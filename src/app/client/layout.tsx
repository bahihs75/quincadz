'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import CartSidebar from '@/components/client/CartSidebar'
import LocationPicker from '@/components/LocationPicker'
import { ShoppingCart, Menu, X, User, MapPin, Globe } from 'lucide-react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { getItemCount, openCart, closeCart } = useCart()
  const { t, language, setLanguage } = useLanguage()
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

  const navItems = [
    { href: '/client', label: t('home') },
    { href: '/client/products', label: t('products') },
    { href: '/client/orders', label: t('orders') },
    { href: '/client/profile', label: t('profile') },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow dark:bg-gray-900">
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

            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                  <Globe size={20} />
                </button>
                <div className="absolute left-0 z-50 mt-2 hidden w-40 rounded-lg border border-gray-200 bg-white shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      language === 'ar' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      language === 'fr' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`block w-full px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      language === 'en' ? 'bg-primary/10 text-primary dark:bg-secondary/30 dark:text-primary' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

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
                <Link href="/client/profile" onClick={handleLinkClick} className="p-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
                  <User size={20} />
                </Link>
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
