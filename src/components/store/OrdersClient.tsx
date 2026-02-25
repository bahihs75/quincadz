'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface Order {
  id: string
  order_number: string
  client_name: string
  client_phone: string
  delivery_address: string
  total_amount: number
  order_status: string // Keep as string, we'll cast later
  created_at: string
}

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const supabase = createClient()

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId)
    if (!error) {
      router.refresh()
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-right py-3 px-4">رقم الطلب</th>
            <th className="text-right py-3 px-4">العميل</th>
            <th className="text-right py-3 px-4">الهاتف</th>
            <th className="text-right py-3 px-4">العنوان</th>
            <th className="text-right py-3 px-4">المبلغ</th>
            <th className="text-right py-3 px-4">الحالة</th>
            <th className="text-right py-3 px-4">التاريخ</th>
            <th className="text-right py-3 px-4">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            // Cast the status to the correct type
            const status = order.order_status as OrderStatus
            return (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{order.order_number}</td>
                <td className="py-3 px-4">{order.client_name}</td>
                <td className="py-3 px-4">{order.client_phone}</td>
                <td className="py-3 px-4">{order.delivery_address}</td>
                <td className="py-3 px-4">{order.total_amount.toLocaleString()} دج</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[status] || 'bg-gray-100'}`}>
                    {status === 'pending' && 'قيد الانتظار'}
                    {status === 'accepted' && 'تم القبول'}
                    {status === 'preparing' && 'قيد التحضير'}
                    {status === 'ready' && 'جاهز للتسليم'}
                    {status === 'delivered' && 'تم التوصيل'}
                    {status === 'cancelled' && 'ملغي'}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                <td className="py-3 px-4">
                  <select
                    defaultValue={order.order_status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="accepted">قبول</option>
                    <option value="preparing">تجهيز</option>
                    <option value="ready">جاهز</option>
                    <option value="delivered">توصيل</option>
                    <option value="cancelled">إلغاء</option>
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
