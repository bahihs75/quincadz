'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LocationPicker from '@/components/LocationPicker'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import ProductCard from '@/components/client/ProductCard'
import Link from 'next/link'
import { Marquee } from "@/components/Marquee"

const PAGE_SIZE = 8

export default function ClientHomePage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('quincadz_location')
    if (saved) {
      setUserLocation(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  useEffect(() => {
    setProducts([])
    setOffset(0)
    setHasMore(true)
    fetchProducts(0)
  }, [userLocation])

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
      .order('created_at', { ascending: false })

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

  const handleLocationSelect = (loc: any) => {
    setUserLocation(loc)
    localStorage.setItem('quincadz_location', JSON.stringify(loc))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!userLocation && (
        <div className="mb-8">
          <LocationPicker onLocationSelect={handleLocationSelect} />
        </div>
      )}

      {categories.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">{t('browse_categories')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/client/products?category=${cat.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center hover:shadow-md transition border border-gray-200 dark:border-gray-700"
              >
                <div className="text-3xl mb-2">{cat.icon || '📦'}</div>
                <span className="text-gray-700 dark:text-gray-300">{cat.name_ar}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">{t('all_products')}</h2>
          <Link href="/client/products" className="text-primary dark:text-primary hover:underline">
            {t('view_all')}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">{t('loading')}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-500">{t('no_products')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-primary dark:bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary dark:hover:bg-secondary disabled:opacity-50"
                >
                  {loadingMore ? t('loading') : t('view_all')}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Marquee className="py-4 bg-gray-100 dark:bg-gray-800 my-8">
        <span className="mx-4 text-sm text-gray-700 dark:text-gray-300">✅ 50+ متجر موثوق</span>
        <span className="mx-4 text-sm text-gray-700 dark:text-gray-300">🚚 توصيل إلى جميع الولايات</span>
        <span className="mx-4 text-sm text-gray-700 dark:text-gray-300">⭐ أكثر من 1000 طلب مكتمل</span>
      </Marquee>
    </div>
  )
}
