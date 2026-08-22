'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import CartSidebar from '@/components/client/CartSidebar'
import LocationPicker from '@/components/LocationPicker'
import { ShoppingCart, Menu, X, MapPin } from 'lucide-react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { getItemCount, openCart, closeCart } = useCart()
  const [user, setUser] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const closeMenu = () => setIsMenuOpen(false)

  const navItems = [
    { href: '/client', label: 'Home' },
    { href: '/client/products', label: 'Products' },
    { href: '/client/orders', label: 'My Orders' },
    { href: '/client/profile', label: 'Profile' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#D8D4CB] bg-[#F5F2EA]/95 shadow-[0_2px_12px_rgba(17,17,17,0.05)] backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Hamburger menu button (left side) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-[#F5C400] md:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Logo centered */}
            <div className="flex-1 flex justify-center">
              <Link href="/client" onClick={closeMenu} className="flex items-center gap-2">
                <img src="/logo.svg" alt="QuincaDZ" className="h-8 w-auto" />
                <span className="text-xl font-bold text-[#F5C400]">QuincaDZ</span>
              </Link>
            </div>

            {/* Cart icon (right side) */}
            <button
              onClick={openCart}
              className="relative min-h-11 min-w-11 p-2 text-gray-600 transition-colors hover:text-[#F5C400]"
            >
              <ShoppingCart size={20} />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5C400] text-xs text-[#111111]">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide‑out menu (sidebar) */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#111111]/60 z-50"
            onClick={closeMenu}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-[#FFFFFF] shadow-[0_18px_48px_rgba(17,17,17,0.12)] z-50 p-6 transform transition-transform duration-300">
            <div className="flex justify-end mb-6">
              <button onClick={closeMenu} className="p-1 text-gray-500 hover:text-[#F5C400]">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-[#F5C400] border-r-2 border-[#F5C400] pr-2'
                      : 'text-gray-700 hover:text-[#F5C400]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Optional: show location inside menu */}
              {userLocation && (
                <button
                  onClick={() => {
                    closeMenu()
                    setShowLocationPicker(true)
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#F5C400] mt-4 pt-4 border-t border-gray-200"
                >
                  <MapPin size={16} />
                  <span className="truncate">{userLocation.wilaya_name}</span>
                </button>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Location picker modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/60 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-[#FFFFFF] shadow-[0_18px_48px_rgba(17,17,17,0.12)]">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={userLocation}
              onClose={() => setShowLocationPicker(false)}
            />
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
