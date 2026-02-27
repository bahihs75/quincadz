'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/client/ProductCard'
import { Filter, Search, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const PAGE_SIZE = 12

function ProductsContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { t } = useLanguage()
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
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">{t('products')}</h1>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg mb-4"
      >
        <Filter size={18} />
        {t('filter')}
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div
          className={`${
            showFilters ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-white dark:bg-gray-900 p-4 rounded-lg shadow h-fit border border-gray-200 dark:border-gray-800`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-black dark:text-white">{t('filter')}</h2>
            <button onClick={clearFilters} className="text-sm text-primary">
              {t('clear_all')}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('search')}</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={t('search_placeholder')}
                className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('category')}</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">{t('all')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('price')}</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t('min')}
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder={t('max')}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('sort_by')}</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="newest">{t('newest')}</option>
              <option value="price_asc">{t('price_low_to_high')}</option>
              <option value="price_desc">{t('price_high_to_low')}</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">{t('loading')}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t('no_products_found')}</p>
              <button
                onClick={clearFilters}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary"
              >
                {t('clear_filters')}
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
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary disabled:opacity-50"
                  >
                    {loadingMore ? t('loading') : t('load_more')}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">{t('loading')}</div>}>
      <ProductsContent />
    </Suspense>
  )
}
