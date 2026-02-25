'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LocationPicker from '@/components/LocationPicker'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import ProductCard from '@/components/client/ProductCard'
import Link from 'next/link'

const PAGE_SIZE = 8

export default function ClientHomePage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()
  const [location, setLocation] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('quincadz_location')
    if (saved) {
      setLocation(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    setProducts([])
    setOffset(0)
    setHasMore(true)
    fetchProducts(0)
  }, [location])

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
    setLocation(loc)
    localStorage.setItem('quincadz_location', JSON.stringify(loc))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!location && (
        <div className="mb-8">
          <LocationPicker onLocationSelect={handleLocationSelect} />
        </div>
      )}

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">{t('browse_categories')}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['مواد بناء', 'أدوات كهربائية', 'سباكة', 'دهانات', 'أدوات يدوية', 'حديقة'].map((cat) => (
            <Link
              key={cat}
              href={`/client/products?category=${encodeURIComponent(cat)}`}
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">
                {cat === 'مواد بناء' && '🧱'}
                {cat === 'أدوات كهربائية' && '⚡'}
                {cat === 'سباكة' && '🚰'}
                {cat === 'دهانات' && '🎨'}
                {cat === 'أدوات يدوية' && '🔧'}
                {cat === 'حديقة' && '🪴'}
              </div>
              <span className="text-gray-700">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">{t('all_products')}</h2>
          <Link href="/client/products" className="text-blue-600 hover:underline">
            {t('view_all')}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">لا توجد منتجات حالياً</div>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingMore ? 'جاري التحميل...' : t('view_all')}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
