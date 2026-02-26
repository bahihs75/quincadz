'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminProductForm from '@/components/admin/AdminProductForm'

export default function AdminNewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from('stores').select('id, store_name').eq('is_active', true)
      setStores(data || [])
      setLoading(false)
    }
    fetchStores()
  }, [supabase])

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">إضافة منتج جديد (مدير)</h1>
      <AdminProductForm stores={stores} />
    </div>
  )
}
