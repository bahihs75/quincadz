'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StoreSetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    address: '',
    delivery_radius_km: '10',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('stores').insert({
      user_id: user.id,
      store_name: formData.store_name,
      description: formData.description,
      address: formData.address,
      delivery_radius_km: parseInt(formData.delivery_radius_km),
      is_verified: false,
      is_active: true,
    })

    setLoading(false)
    if (!error) {
      router.push('/store')
    } else {
      alert('حدث خطأ: ' + error.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">إعداد المتجر</h1>
      <p className="mb-4 text-gray-600">يرجى إكمال معلومات متجرك للمتابعة</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">اسم المتجر *</label>
          <input
            type="text"
            required
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">الوصف</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-700">العنوان *</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-gray-700">نطاق التوصيل (كم)</label>
          <input
            type="number"
            min="1"
            value={formData.delivery_radius_km}
            onChange={(e) => setFormData({ ...formData, delivery_radius_km: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ وإكمال'}
        </button>
      </form>
    </div>
  )
}
