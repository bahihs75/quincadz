'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name_ar)), stores(store_name)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [supabase])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={18} className="text-yellow-500" />
      case 'accepted': return <Package size={18} className="text-blue-500" />
      case 'preparing': return <Package size={18} className="text-purple-500" />
      case 'ready': return <CheckCircle size={18} className="text-green-500" />
      case 'delivered': return <Truck size={18} className="text-green-600" />
      case 'cancelled': return <XCircle size={18} className="text-red-500" />
      default: return null
    }
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'قيد الانتظار',
      accepted: 'تم القبول',
      preparing: 'قيد التحضير',
      ready: 'جاهز للتسليم',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    }
    return map[status] || status
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">جاري التحميل...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          تم إنشاء طلبك بنجاح! سيتم التواصل معك قريباً.
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-black">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">لا توجد طلبات بعد</p>
          <Link
            href="/client/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm text-gray-500">رقم الطلب: </span>
                    <span className="font-mono text-sm">{order.order_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.order_status)}
                    <span className="text-sm font-medium">{getStatusText(order.order_status)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.products?.name_ar} x {item.quantity}
                      </span>
                      <span>{item.total_price.toLocaleString()} دج</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">المتجر: </span>
                    <span className="font-medium">{order.stores?.store_name}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-gray-500">الإجمالي: </span>
                    <span className="font-bold text-blue-600">
                      {order.total_amount.toLocaleString()} دج
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-EG')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
