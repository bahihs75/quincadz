'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminProductForm from '@/components/admin/AdminProductForm'

export default function AdminEditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [storesResult, productResult] = await Promise.all([
        supabase.from('stores').select('id, store_name').eq('is_active', true),
        supabase.from('products').select('*').eq('id', id).single()
      ])
      setStores(storesResult.data || [])
      if (productResult.data) {
        setProduct(productResult.data)
      } else {
        router.push('/admin/products')
      }
      setLoading(false)
    }
    fetchData()
  }, [id, supabase, router])

  if (loading) return <div>جاري التحميل...</div>
  if (!product) return null

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">تعديل المنتج</h1>
      <AdminProductForm product={product} stores={stores} />
    </div>
  )
}
