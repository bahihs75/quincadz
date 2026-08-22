'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import ProductCard from '@/components/client/ProductCard'
import type { Category, Product } from '@/lib/types'
import { Filter, Search, X } from 'lucide-react'

const PAGE_SIZE = 12

type ProductFilters = {
  category: string
  search: string
  minPrice: string
  maxPrice: string
  sort: 'newest' | 'price_asc' | 'price_desc'
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const supabase = isSupabaseConfigured ? createClient() : null
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    category: searchParams.get('category') || '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  }))

  useEffect(() => {
    const fetchCategories = async () => {
      if (!supabase) return
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name_ar, name_fr, is_active, sort_order')
        .eq('is_active', true)
        .order('sort_order')

      if (categoriesError) {
        setError('تعذر تحميل التصنيفات. حاول تحديث الصفحة.')
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

    let query = supabase
      .from('products')
      .select('id, name_ar, name_fr, description_ar, description_fr, price, images, store_id, unit, stock_quantity, is_available, stores(id, store_name, phone, address)')
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .range(currentOffset, currentOffset + PAGE_SIZE - 1)

    if (filters.category) query = query.eq('category_id', filters.category)

    const normalizedSearch = filters.search.trim().replace(/[%_,()]/g, ' ')
    if (normalizedSearch) {
      query = query.or(`name_ar.ilike.%${normalizedSearch}%,name_fr.ilike.%${normalizedSearch}%`)
    }

    const minPrice = Number(filters.minPrice)
    if (filters.minPrice && Number.isFinite(minPrice)) query = query.gte('price', minPrice)

    const maxPrice = Number(filters.maxPrice)
    if (filters.maxPrice && Number.isFinite(maxPrice)) query = query.lte('price', maxPrice)

    if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
    else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data, error: productsError } = await query
    if (productsError) {
      setError('تعذر تحميل المنتجات حالياً. حاول مرة أخرى.')
    } else {
      const nextProducts = (data || []) as unknown as Product[]
      setProducts((current) => loadMore ? [...current, ...nextProducts] : nextProducts)
      setHasMore(nextProducts.length === PAGE_SIZE)
    }

    if (loadMore) setLoadingMore(false)
    else setLoading(false)
  }, [filters, supabase])

  useEffect(() => {
    setProducts([])
    setOffset(0)
    setHasMore(true)
    void fetchProducts(0)
  }, [fetchProducts])

  const updateFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const loadMore = () => {
    if (loadingMore || !hasMore) return
    const newOffset = offset + PAGE_SIZE
    setOffset(newOffset)
    void fetchProducts(newOffset)
  }

  const clearFilters = () => {
    setFilters({ category: '', search: '', minPrice: '', maxPrice: '', sort: 'newest' })
  }

  const activeFilterCount = useMemo(() => {
    return [filters.category, filters.search, filters.minPrice, filters.maxPrice].filter(Boolean).length
  }, [filters])

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#D8D4CB] pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#777777]">CATALOG / LOCAL INVENTORY</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111]">المنتجات</h1>
          <p className="mt-2 text-sm text-[#777777]">اعثر على الأدوات والمواد المتوفرة لدى متاجر قريبة منك.</p>
        </div>
        <span className="hidden border border-[#D8D4CB] bg-white px-3 py-2 text-xs font-semibold text-[#777777] sm:inline-flex">
          {activeFilterCount > 0 ? `${activeFilterCount} فلاتر نشطة` : 'كل المنتجات'}
        </span>
      </div>

      <button
        onClick={() => setShowFilters((current) => !current)}
        aria-expanded={showFilters}
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#111111] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#242424] md:hidden"
      >
        <Filter size={18} aria-hidden="true" />
        {showFilters ? 'إخفاء الفلاتر' : 'الفلاتر'}
        {activeFilterCount > 0 && <span className="rounded-full bg-[#F5C400] px-2 py-0.5 text-xs text-[#111111]">{activeFilterCount}</span>}
      </button>

      <div className="grid gap-8 md:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className={`${showFilters ? 'block' : 'hidden'} h-fit border border-[#D8D4CB] bg-white p-5 md:block`}>
          <div className="flex items-center justify-between border-b border-[#D8D4CB] pb-4">
            <h2 className="font-bold text-[#111111]">تصفية النتائج</h2>
            <button onClick={clearFilters} className="text-xs font-semibold text-[#777777] transition hover:text-[#F5C400]">مسح الكل</button>
          </div>

          <div className="mt-5 grid gap-2">
            <label htmlFor="catalog-search" className="text-sm font-semibold text-[#111111]">البحث</label>
            <div className="relative">
              <input
                id="catalog-search"
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="اسم المنتج أو النوع"
                className="input w-full pl-9"
              />
              <Search size={16} className="absolute left-3 top-3.5 text-[#777777]" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <label htmlFor="catalog-category" className="text-sm font-semibold text-[#111111]">التصنيف</label>
            <select id="catalog-category" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="input w-full">
              <option value="">كل التصنيفات</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name_ar}</option>)}
            </select>
          </div>

          <div className="mt-5 grid gap-2">
            <span className="text-sm font-semibold text-[#111111]">السعر بالدينار</span>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="0" placeholder="من" value={filters.minPrice} onChange={(event) => updateFilter('minPrice', event.target.value)} className="input w-full" aria-label="الحد الأدنى للسعر" />
              <input type="number" min="0" placeholder="إلى" value={filters.maxPrice} onChange={(event) => updateFilter('maxPrice', event.target.value)} className="input w-full" aria-label="الحد الأقصى للسعر" />
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <label htmlFor="catalog-sort" className="text-sm font-semibold text-[#111111]">الترتيب</label>
            <select id="catalog-sort" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value as ProductFilters['sort'])} className="input w-full">
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
            </select>
          </div>
        </aside>

        <section aria-live="polite" className="min-w-0">
          {!isSupabaseConfigured && (
            <div role="status" className="mb-5 border border-[#3F6475]/30 bg-[#3F6475]/10 px-4 py-3 text-sm text-[#3F6475]">المعاينة تعمل دون ربط قاعدة البيانات. أضف إعدادات Supabase لعرض المنتجات الفعلية.</div>
          )}
          {error && (
            <div role="alert" className="mb-5 flex items-center justify-between gap-4 border border-[#C62828]/30 bg-[#C62828]/10 px-4 py-3 text-sm text-[#C62828]">
              <span>{error}</span>
              <button onClick={() => void fetchProducts(0)} className="shrink-0 font-bold underline">إعادة المحاولة</button>
            </div>
          )}

          {loading ? <ProductGridSkeleton /> : products.length === 0 ? (
            <div className="border border-dashed border-[#D8D4CB] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F2EA] text-[#777777]"><Search size={20} aria-hidden="true" /></div>
              <h2 className="mt-4 text-lg font-bold text-[#111111]">لا توجد منتجات بهذه المواصفات</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777777]">جرّب إزالة بعض الفلاتر أو ابحث باسم مختلف. سنضيف قريباً طلب قطعة غير موجودة في الكتالوج.</p>
              <button onClick={clearFilters} className="btn-primary mt-5">مسح الفلاتر</button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {hasMore && (
                <div className="mt-10 text-center">
                  <button onClick={loadMore} disabled={loadingMore} className="min-h-11 border border-[#111111] bg-white px-6 py-3 text-sm font-bold text-[#111111] transition hover:border-[#F5C400] hover:bg-[#F5F2EA] disabled:cursor-not-allowed disabled:opacity-50">
                    {loadingMore ? 'جارٍ التحميل…' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {showFilters && <button aria-label="إغلاق الفلاتر" onClick={() => setShowFilters(false)} className="fixed inset-0 z-30 bg-[#111111]/60 md:hidden"><X className="sr-only" /></button>}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="product-grid" aria-label="جارٍ تحميل المنتجات" role="status">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden border border-[#D8D4CB] bg-white">
          <div className="aspect-square animate-pulse bg-[#F5F2EA]" />
          <div className="grid gap-3 p-4">
            <div className="h-5 w-4/5 animate-pulse bg-[#F5F2EA]" />
            <div className="h-4 w-2/5 animate-pulse bg-[#F5F2EA]" />
            <div className="h-10 w-full animate-pulse bg-[#F5F2EA]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-[#777777]">جارٍ تحميل الكتالوج…</div>}>
      <ProductsContent />
    </Suspense>
  )
}
