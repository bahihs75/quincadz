'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, X, Eye, Edit, Trash2 } from 'lucide-react'

interface Store {
  id: string
  store_name: string
  is_verified: boolean
  is_active: boolean
  users: { email: string; full_name: string }
  wilayas?: { name_ar: string }
  baladiyas?: { name_ar: string }
  created_at: string
}

export default function StoreTable({ stores }: { stores: Store[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [processing, setProcessing] = useState<string | null>(null)

  const toggleVerification = async (storeId: string, current: boolean) => {
    setProcessing(storeId)
    await supabase.from('stores').update({ is_verified: !current }).eq('id', storeId)
    setProcessing(null)
    router.refresh()
  }

  const toggleActive = async (storeId: string, current: boolean) => {
    setProcessing(storeId)
    await supabase.from('stores').update({ is_active: !current }).eq('id', storeId)
    setProcessing(null)
    router.refresh()
  }

  const deleteStore = async (storeId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتجر؟')) return
    setProcessing(storeId)
    await supabase.from('stores').delete().eq('id', storeId)
    setProcessing(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right py-3 px-4">المتجر</th>
              <th className="text-right py-3 px-4">المالك</th>
              <th className="text-right py-3 px-4">الموقع</th>
              <th className="text-right py-3 px-4">موثق</th>
              <th className="text-right py-3 px-4">نشط</th>
              <th className="text-right py-3 px-4">تاريخ التسجيل</th>
              <th className="text-right py-3 px-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{store.store_name}</td>
                <td className="py-3 px-4">
                  {store.users?.full_name}<br />
                  <span className="text-xs text-gray-500">{store.users?.email}</span>
                </td>
                <td className="py-3 px-4">
                  {store.wilayas?.name_ar} - {store.baladiyas?.name_ar}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleVerification(store.id, store.is_verified)}
                    disabled={processing === store.id}
                    className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
                      store.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {store.is_verified ? <Check size={14} /> : <X size={14} />}
                    {store.is_verified ? 'موثق' : 'غير موثق'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(store.id, store.is_active)}
                    disabled={processing === store.id}
                    className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
                      store.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {store.is_active ? 'نشط' : 'موقوف'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  {new Date(store.created_at).toLocaleDateString('ar-EG')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/stores/${store.id}`)}
                      className="p-1 text-primary hover:bg-blue-50 rounded"
                      title="عرض"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/stores/${store.id}/edit`)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteStore(store.id)}
                      disabled={processing === store.id}
                      className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
