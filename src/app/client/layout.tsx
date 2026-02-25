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
  const [location, setLocation] = useState<any>(null)
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
      setLocation(JSON.parse(saved))
    } else {
      // If no location saved, open picker automatically
      setShowLocationPicker(true)
    }
  }, [supabase])

  const handleLocationSelect = (loc: any) => {
    setLocation(loc)
    localStorage.setItem('quincadz_location', JSON.stringify(loc))
    setShowLocationPicker(false)
    // Optionally refresh products based on new location
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
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/client" onClick={handleLinkClick} className="text-2xl font-bold text-blue-600">
              QuincaDZ
            </Link>

            <nav className="hidden md:flex space-x-6 space-x-reverse">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* Language selector */}
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:text-blue-600">
                  <Globe size={20} />
                </button>
                <div className="absolute left-0 mt-2 w-40 bg-white border rounded-lg shadow-lg hidden group-hover:block">
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${
                      language === 'ar' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${
                      language === 'fr' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${
                      language === 'en' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Location indicator with change button */}
              {location && (
                <div className="hidden md:flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="ml-1" />
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="hover:text-blue-600 underline"
                  >
                    {location.wilaya_name} - {location.baladiya_name}
                  </button>
                </div>
              )}

              <button
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:text-blue-600"
              >
                <ShoppingCart size={20} />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {user ? (
                <Link href="/client/profile" onClick={handleLinkClick} className="p-2 text-gray-600 hover:text-blue-600">
                  <User size={20} />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={handleLinkClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  {t('login')}
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile location (always visible) */}
          {location && (
            <div className="md:hidden flex items-center justify-center py-2 text-sm text-gray-600 border-t">
              <MapPin size={14} className="ml-1" />
              <button
                onClick={() => setShowLocationPicker(true)}
                className="hover:text-blue-600 underline"
              >
                {location.wilaya_name} - {location.baladiya_name}
              </button>
            </div>
          )}

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
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

      {/* Location picker modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">تحديد الموقع</h3>
              <button onClick={() => setShowLocationPicker(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={location}
              />
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gray-50">
        {children}
      </main>

      <CartSidebar />
    </>
  )
}
