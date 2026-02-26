'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductForm from '@/components/store/ProductForm'

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<any>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!store) {
        router.push('/store/setup')
        return
      }
      setStoreId(store.id)

      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (!product) {
        router.push('/store/products')
        return
      }
      setProduct(product)
      setLoading(false)
    }
    fetchData()
  }, [id, supabase, router])

  if (loading) return <div>جاري التحميل...</div>
  if (!storeId || !product) return null

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">تعديل المنتج</h1>
      <ProductForm initialData={product} storeId={storeId} />
    </div>
  )
}
