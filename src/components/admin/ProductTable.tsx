'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Eye } from 'lucide-react'

interface Product {
  id: string
  name_ar: string
  price: number
  unit: string
  stock_quantity: number
  stores: { store_name: string }
}

export default function AdminProductTable({ products }: { products: Product[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    setDeleting(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      router.refresh()
    } else {
      alert('حدث خطأ أثناء الحذف: ' + error.message)
    }
    setDeleting(null)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right py-3 px-4">المنتج</th>
              <th className="text-right py-3 px-4">المتجر</th>
              <th className="text-right py-3 px-4">السعر</th>
              <th className="text-right py-3 px-4">المخزون</th>
              <th className="text-right py-3 px-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{product.name_ar}</td>
                <td className="py-3 px-4">{product.stores?.store_name}</td>
                <td className="py-3 px-4">{product.price.toLocaleString()} دج / {product.unit}</td>
                <td className="py-3 px-4">{product.stock_quantity}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/client/product/${product.id}`)}
                      className="p-1 text-primary hover:bg-blue-50 rounded"
                      title="عرض"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
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
