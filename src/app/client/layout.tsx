'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import CartSidebar from '@/components/client/CartSidebar'
import LocationPicker from '@/components/LocationPicker'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { LogIn, LogOut, Menu, MapPin, ShoppingCart, UserCircle, X } from 'lucide-react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { getItemCount, openCart } = useCart()
  const { t } = useLanguage()
  const [user, setUser] = useState<unknown>(null)
  const [userLocation, setUserLocation] = useState<{ wilaya_name: string; baladiya_name?: string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const supabase = isSupabaseConfigured ? createClient() : null

  useEffect(() => {
    if (supabase) {
      const getUser = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        setUser(currentUser)
      }
      void getUser()
    }

    try {
      const saved = localStorage.getItem('quincadz_location')
      if (saved) setUserLocation(JSON.parse(saved) as { wilaya_name: string; baladiya_name?: string })
    } catch {
      localStorage.removeItem('quincadz_location')
    }
  }, [supabase])

  const handleLocationSelect = (location: { wilaya_name: string; baladiya_name?: string }) => {
    setUserLocation(location)
    localStorage.setItem('quincadz_location', JSON.stringify(location))
    setShowLocationPicker(false)
  }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setIsMenuOpen(false)
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
      <header className="sticky top-0 z-40 border-b border-[#D8D4CB] bg-[#F5F2EA]/95 shadow-[0_2px_12px_rgba(17,17,17,0.05)] backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="relative flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsMenuOpen(true)} aria-label="فتح القائمة" className="icon-button">
                <Menu size={19} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-4 md:flex">
                {navItems.slice(1, 3).map((item) => <Link key={item.href} href={item.href} className={`text-sm font-bold transition hover:text-[#F5C400] ${pathname === item.href ? 'text-[#111111] underline decoration-[#F5C400] decoration-2 underline-offset-4' : 'text-[#777777]'}`}>{item.label}</Link>)}
              </nav>
            </div>

            <Link href="/client" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2" aria-label="QuincaDZ">
              <img src="/logo.svg" alt="QuincaDZ" className="h-8 w-auto" />
              <span className="hidden text-xl font-extrabold tracking-tight text-[#111111] sm:inline">Quinca<span className="text-[#F5C400]">DZ</span></span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/client/profile" aria-label={t('profile')} title={t('profile')} className="icon-button hidden sm:inline-flex">
                <UserCircle size={19} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              <button type="button" onClick={openCart} aria-label={t('cart')} title={t('cart')} className="icon-button relative">
                <ShoppingCart size={19} strokeWidth={1.8} aria-hidden="true" />
                {getItemCount() > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F5C400] px-1 text-xs text-[#111111]">{getItemCount()}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <button type="button" aria-label="إغلاق القائمة" className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-[2px]" onClick={() => setIsMenuOpen(false)} />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-[min(22rem,88vw)] flex-col border-l border-[#D8D4CB] bg-[#FFFFFF] p-6 shadow-[0_24px_64px_rgba(17,17,17,0.16)]">
            <div className="flex items-center justify-between border-b border-[#D8D4CB] pb-5">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#777777]">QUINCADZ / MENU</p><p className="mt-1 text-lg font-extrabold">القائمة</p></div>
              <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="إغلاق القائمة" className="icon-button"><X size={18} strokeWidth={1.8} aria-hidden="true" /></button>
            </div>

            <nav aria-label="قائمة العميل" className="grid gap-1 py-5">
              {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className={`flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-bold transition ${pathname === item.href ? 'bg-[#F5C400] text-[#111111]' : 'text-[#777777] hover:bg-[#F5F2EA] hover:text-[#111111]'}`}>{item.label}</Link>)}
              <button type="button" onClick={() => { setIsMenuOpen(false); setShowLocationPicker(true) }} className="mt-2 flex min-h-11 items-center gap-3 border-t border-[#D8D4CB] px-4 pt-4 text-right text-sm font-bold text-[#777777] transition hover:text-[#111111]">
                <MapPin size={18} strokeWidth={1.8} className="text-[#F5C400]" aria-hidden="true" />
                <span>{userLocation ? `${t('choose_location')}: ${userLocation.wilaya_name}` : t('choose_location')}</span>
              </button>
            </nav>

            <div className="mt-auto grid gap-5 border-t border-[#D8D4CB] pt-5">
              <div><p className="mb-3 text-xs font-bold text-[#777777]">{t('language')}</p><LanguageSwitcher /></div>
              {user ? <button type="button" onClick={handleLogout} className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold text-[#777777] transition hover:bg-[#F5F2EA] hover:text-[#111111]"><LogOut size={18} strokeWidth={1.8} aria-hidden="true" />{t('logout')}</button> : <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className="btn-primary w-full"><LogIn size={18} strokeWidth={1.8} aria-hidden="true" />{t('login')}</Link>}
            </div>
          </aside>
        </>
      )}

      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/60 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md bg-[#FFFFFF] shadow-[0_24px_64px_rgba(17,17,17,0.16)]">
            <LocationPicker onLocationSelect={handleLocationSelect} initialLocation={userLocation} onClose={() => setShowLocationPicker(false)} />
          </div>
        </div>
      )}

      <main className="min-h-screen">{children}</main>
      <CartSidebar />
    </>
  )
}
