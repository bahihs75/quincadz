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
    <div className="section-white">
      <div className="container mx-auto px-4 section-padding">
        {!userLocation && (
          <div className="mb-8">
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>
        )}

        {categories.length > 0 && (
          <section className="section-gray py-12 rounded-card mb-12">
            <div className="container mx-auto px-4">
              <h2 className="text-h2 font-bold text-neutral-900 mb-6">{t('browse_categories')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/client/products?category=${cat.id}`}
                    className="group card card-hover p-4 text-center"
                  >
                    <div className="text-3xl mb-2">{cat.icon || '📦'}</div>
                    <span className="text-neutral-700 dark:text-neutral-300">{cat.name_ar}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h2 font-bold text-neutral-900">{t('all_products')}</h2>
            <Link href="/client/products" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              {t('view_all')}
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-500">{t('loading')}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">{t('no_products')}</div>
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
                    className="btn-primary"
                  >
                    {loadingMore ? t('loading') : t('view_all')}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <Marquee className="py-4 bg-neutral-100 my-8">
          <span className="mx-4 text-small text-neutral-700">✅ 50+ متجر موثوق</span>
          <span className="mx-4 text-small text-neutral-700">🚚 توصيل إلى جميع الولايات</span>
          <span className="mx-4 text-small text-neutral-700">⭐ أكثر من 1000 طلب مكتمل</span>
        </Marquee>
      </div>
    </div>
  )
}
