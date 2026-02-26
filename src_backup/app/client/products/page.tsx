'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/client/ProductCard'
import { Filter, Search, X } from 'lucide-react'

const PAGE_SIZE = 12

// This component uses useSearchParams and must be wrapped in Suspense
function ProductsContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  // Reset and fetch on filter change
  useEffect(() => {
    setProducts([])
    setOffset(0)
    setHasMore(true)
    fetchProducts(0)
  }, [filters])

  const fetchProducts = async (currentOffset: number) => {
    const loadMore = currentOffset > 0
    if (loadMore) setLoadingMore(true)
    else setLoading(true)

    let query = supabase
      .from('products')
      .select('*, stores(*)')
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .range(currentOffset, currentOffset + PAGE_SIZE - 1)

    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters.search) {
      query = query.or(`name_ar.ilike.%${filters.search}%,name_fr.ilike.%${filters.search}%`)
    }

    if (filters.minPrice) {
      query = query.gte('price', parseFloat(filters.minPrice))
    }

    if (filters.maxPrice) {
      query = query.lte('price', parseFloat(filters.maxPrice))
    }

    switch (filters.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data } = await query

    if (data) {
      if (loadMore) {
        setProducts(prev => [...prev, ...data])
      } else {
        setProducts(data)
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    if (loadMore) setLoadingMore(false)
    else setLoading(false)
  }

  const loadMore = () => {
    const newOffset = offset + PAGE_SIZE
    setOffset(newOffset)
    fetchProducts(newOffset)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black">المنتجات</h1>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg mb-4"
      >
        <Filter size={18} />
        فلتر
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div
          className={`${
            showFilters ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-white p-4 rounded-lg shadow h-fit`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">تصفية</h2>
            <button onClick={clearFilters} className="text-sm text-primary dark:text-primary">
              مسح الكل
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">بحث</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="اسم المنتج..."
                className="w-full p-2 pr-8 border rounded"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-400" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">الفئة</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">الكل</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">السعر (دج)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="من"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="إلى"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-1/2 p-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">ترتيب حسب</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="newest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
              <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">جاري التحميل...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">لا توجد منتجات تطابق معايير البحث</p>
              <button
                onClick={clearFilters}
                className="bg-primary text-white px-6 py-2 rounded-lg"
              >
                مسح الفلاتر
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary disabled:opacity-50"
                  >
                    {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">جاري التحميل...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
