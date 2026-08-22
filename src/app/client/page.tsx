'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LocationPicker from '@/components/LocationPicker'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import ProductCard from '@/components/client/ProductCard'
import type { Category, LocationSelection, Product } from '@/lib/types'
import { PILOT_WILAYAS } from '@/lib/launch'
import Link from 'next/link'
import { ArrowLeft, MapPin, Search, ShieldCheck, Truck } from 'lucide-react'

const PAGE_SIZE = 8

export default function ClientHomePage() {
  const router = useRouter()
  const supabase = isSupabaseConfigured ? createClient() : null
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState<LocationSelection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('quincadz_location')
      if (saved) setUserLocation(JSON.parse(saved) as LocationSelection)
    } catch {
      localStorage.removeItem('quincadz_location')
    }
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      if (!supabase) return
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name_ar, name_fr, icon, is_active, sort_order')
        .eq('is_active', true)
        .order('sort_order')

      if (categoriesError) {
        console.error('QuincaDZ categories query failed', { code: categoriesError.code, message: categoriesError.message, details: categoriesError.details })
        setError(categoriesError.code === '42501' ? 'لا تملك هذه الجلسة صلاحية قراءة التصنيفات في Supabase.' : 'تعذر تحميل التصنيفات حالياً.')
        return
      }
      setCategories((data || []) as Category[])
    }

    void fetchCategories()
  }, [supabase])

  const fetchProducts = useCallback(async (currentOffset: number) => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const loadMore = currentOffset > 0
    if (loadMore) setLoadingMore(true)
    else setLoading(true)
    setError('')

    const { data, error: productsError } = await supabase
      .from('products')
      .select('*, stores(*)')
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1)

    if (productsError) {
      console.error('QuincaDZ products query failed', { code: productsError.code, message: productsError.message, details: productsError.details })
      setError(productsError.code === '42501' ? 'لا تملك هذه الجلسة صلاحية قراءة المنتجات. راجع سياسة قراءة المنتجات في Supabase.' : 'تعذر تحميل المنتجات حالياً. حاول مرة أخرى.')
    } else {
      const nextProducts = (data || []) as unknown as Product[]
      setProducts((current) => loadMore ? [...current, ...nextProducts] : nextProducts)
      setHasMore(nextProducts.length === PAGE_SIZE)
    }

    if (loadMore) setLoadingMore(false)
    else setLoading(false)
  }, [supabase])

  useEffect(() => {
    setProducts([])
    setOffset(0)
    setHasMore(true)
    void fetchProducts(0)
  }, [fetchProducts, userLocation])

  const loadMore = () => {
    if (loadingMore || !hasMore) return
    const newOffset = offset + PAGE_SIZE
    setOffset(newOffset)
    void fetchProducts(newOffset)
  }

  const handleLocationSelect = (location: LocationSelection) => {
    setUserLocation(location)
    localStorage.setItem('quincadz_location', JSON.stringify(location))
  }

  return (
    <main className="min-h-[100dvh] bg-[#F5F2EA] text-[#111111]">
      <section className="border-b border-[#D8D4CB] bg-[#111111] text-white">
        <div className="container grid min-h-[34rem] items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#F5C400]">QUINCADZ / LOCAL CATALOG</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-6xl">كل ما تحتاجه للورشة، من متجر قريب منك.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">اكتشف الأدوات ومواد الصيانة المتوفرة محلياً، اطلب بسهولة، وتابع التوصيل بالدفع عند الاستلام.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/client/products" className="btn-primary"><Search size={17} aria-hidden="true" /> اكتشف المنتجات <ArrowLeft size={17} aria-hidden="true" /></Link>
              <button onClick={() => router.push('/client/products')} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:border-[#F5C400] hover:text-[#F5C400]">ابحث حسب الفئة</button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/60">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#F5C400]" aria-hidden="true" /> أسعار واضحة</span>
              <span className="inline-flex items-center gap-2"><Truck size={15} className="text-[#F5C400]" aria-hidden="true" /> توصيل محلي</span>
              <span className="inline-flex items-center gap-2"><MapPin size={15} className="text-[#F5C400]" aria-hidden="true" /> حسب الولاية</span>
            </div>
          </div>

          <div className="lg:justify-self-end lg:w-full lg:max-w-md">
            {userLocation ? (
              <div className="border border-white/15 bg-[#242424] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">DELIVERY AREA</p>
                    <p className="mt-2 text-xl font-bold">{userLocation.wilaya_name}</p>
                    {userLocation.baladiya_name && <p className="mt-1 text-sm text-white/60">{userLocation.baladiya_name}</p>}
                  </div>
                  <MapPin className="text-[#F5C400]" size={22} aria-hidden="true" />
                </div>
                <button onClick={() => setUserLocation(null)} className="mt-6 text-sm font-bold text-[#F5C400] underline underline-offset-4">تغيير المنطقة</button>
              </div>
            ) : (
              <div className="[&>div]:shadow-none">
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container py-12 sm:py-16">
        {categories.length > 0 && (
          <section className="mb-16">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#777777]">BROWSE / CATEGORIES</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">ابدأ من احتياجك</h2>
              </div>
              <Link href="/client/products" className="hidden items-center gap-2 text-sm font-bold text-[#111111] underline decoration-[#F5C400] decoration-2 underline-offset-4 sm:inline-flex">كل التصنيفات <ArrowLeft size={15} aria-hidden="true" /></Link>
            </div>
            <div className="grid overflow-hidden border border-[#D8D4CB] bg-white sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 8).map((category, index) => (
                <Link key={category.id} href={`/client/products?category=${category.id}`} className={`group flex min-h-24 items-center justify-between gap-3 p-5 transition hover:bg-[#F5F2EA] ${index > 0 ? 'border-t border-[#D8D4CB] sm:border-l sm:border-t-0 lg:border-l' : ''}`}>
                  <span className="font-bold text-[#111111]">{category.name_ar}</span>
                  <ArrowLeft size={17} className="text-[#777777] transition group-hover:-translate-x-1 group-hover:text-[#F5C400]" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#D8D4CB] pb-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#777777]">LATEST / IN STOCK</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">منتجات متوفرة الآن</h2>
            </div>
            <Link href="/client/products" className="inline-flex items-center gap-2 text-sm font-bold text-[#111111] underline decoration-[#F5C400] decoration-2 underline-offset-4">عرض الكل <ArrowLeft size={15} aria-hidden="true" /></Link>
          </div>

          {error && <div role="alert" className="mb-5 border border-[#C62828]/30 bg-[#C62828]/10 px-4 py-3 text-sm text-[#C62828]">{error} <button onClick={() => void fetchProducts(0)} className="font-bold underline">إعادة المحاولة</button></div>}
          {loading ? <HomeProductSkeleton /> : products.length === 0 ? (
            <div className="border border-dashed border-[#D8D4CB] bg-white px-6 py-14 text-center text-[#777777]">لا توجد منتجات متوفرة حالياً في الكتالوج.</div>
          ) : (
            <>
              <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
              {hasMore && <div className="mt-10 text-center"><button onClick={loadMore} disabled={loadingMore} className="min-h-11 border border-[#111111] bg-white px-6 py-3 text-sm font-bold transition hover:border-[#F5C400] hover:bg-[#F5F2EA] disabled:opacity-50">{loadingMore ? t('loading') : 'تحميل المزيد'}</button></div>}
            </>
          )}
        </section>

        <section className="mt-16 border-t border-[#D8D4CB] pt-8">
          <p className="text-sm leading-7 text-[#777777]">نبدأ حالياً في ثلاث ولايات تجريبية: {PILOT_WILAYAS.map((wilaya) => wilaya.nameAr).join('، ')}. نطاق التوصيل الظاهر يعتمد على المتاجر المتاحة فعلياً، وليس على وعد وطني عام.</p>
        </section>
      </div>
    </main>
  )
}

function HomeProductSkeleton() {
  return <div className="product-grid" role="status" aria-label="جارٍ تحميل المنتجات">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="overflow-hidden border border-[#D8D4CB] bg-white"><div className="aspect-square animate-pulse bg-[#F5F2EA]" /><div className="grid gap-3 p-4"><div className="h-5 w-4/5 animate-pulse bg-[#F5F2EA]" /><div className="h-4 w-2/5 animate-pulse bg-[#F5F2EA]" /><div className="h-10 w-full animate-pulse bg-[#F5F2EA]" /></div></div>)}</div>
}
