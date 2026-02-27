'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

function OrdersContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const supabase = createClient()
  const { t } = useLanguage()
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
      pending: t('pending'),
      accepted: t('accepted'),
      preparing: t('preparing'),
      ready: t('ready'),
      delivered: t('delivered'),
      cancelled: t('cancelled'),
    }
    return map[status] || status
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">"Loading..."</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-6">
          {t('order_success')}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">{t('my_orders')}</h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-800">
          <Package size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('no_orders')}</p>
          <Link
            href="/client/products"
            className="bg-primary text-white px-6 py-2 rounded-lg inline-block hover:bg-secondary"
          >
            {t('browse_products')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('order_number')}: </span>
                    <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{order.order_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.order_status)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusText(order.order_status)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.products?.name_ar} x {item.quantity}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">{item.total_price.toLocaleString()} DA</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('store')}: </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{order.stores?.store_name}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('total')}: </span>
                    <span className="font-bold text-primary">
                      {order.total_amount.toLocaleString()} DA
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {t('order_date')}: {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">"Loading..."</div>}>
      <OrdersContent />
    </Suspense>
  )
}
