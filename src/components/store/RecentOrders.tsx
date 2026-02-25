import { createClient } from '@/lib/supabase/server'

export default async function RecentOrders({ storeId }: { storeId: string }) {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(5)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">آخر الطلبات</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-right py-2">رقم الطلب</th>
              <th className="text-right py-2">العميل</th>
              <th className="text-right py-2">المبلغ</th>
              <th className="text-right py-2">الحالة</th>
              <th className="text-right py-2">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{order.order_number}</td>
                <td className="py-3">{order.client_name}</td>
                <td className="py-3">{order.total_amount.toLocaleString()} دج</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[order.order_status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                    {order.order_status === 'pending' && 'قيد الانتظار'}
                    {order.order_status === 'accepted' && 'تم القبول'}
                    {order.order_status === 'preparing' && 'قيد التحضير'}
                    {order.order_status === 'delivered' && 'تم التوصيل'}
                    {order.order_status === 'cancelled' && 'ملغي'}
                  </span>
                </td>
                <td className="py-3">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
