'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductForm from '@/components/store/ProductForm'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getStore = async () => {
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
      setLoading(false)
    }
    getStore()
  }, [supabase, router])

  if (loading) return <div>جاري التحميل...</div>
  if (!storeId) return null

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">إضافة منتج جديد</h1>
      <ProductForm storeId={storeId} />
    </div>
  )
}
