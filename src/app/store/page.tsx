import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BentoGrid, BentoItem } from '@/components/ui/BentoGrid'
import { Package, ShoppingBag, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default async function StoreDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!store) redirect('/store/setup')

  // Fetch stats
  const [productsCount, ordersCount, revenueResult] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', store.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', store.id),
    supabase.from('orders').select('total_amount').eq('store_id', store.id).eq('order_status', 'delivered'),
  ])

  const revenue = revenueResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">لوحة التحكم</h1>
      <BentoGrid>
        <BentoItem
          title="إجمالي المنتجات"
          description={`${productsCount.count || 0} منتج`}
          icon={<Package className="h-4 w-4 text-neutral-500" />}
          className="md:col-span-1"
        />
        <BentoItem
          title="إجمالي الطلبات"
          description={`${ordersCount.count || 0} طلب`}
          icon={<ShoppingBag className="h-4 w-4 text-neutral-500" />}
          className="md:col-span-1"
        />
        <BentoItem
          title="الإيرادات"
          description={`${revenue.toLocaleString()} دج`}
          icon={<DollarSign className="h-4 w-4 text-neutral-500" />}
          className="md:col-span-1"
        />
        <BentoItem
          title="آخر الطلبات"
          description={
            <ul className="list-disc list-inside text-sm">
              {recentOrders?.map(order => (
                <li key={order.id}>طلب #{order.order_number} - {order.total_amount} دج</li>
              ))}
            </ul>
          }
          icon={<Clock className="h-4 w-4 text-neutral-500" />}
          className="md:col-span-2"
        />
        <BentoItem
          title="تنبيهات"
          description="لا توجد تنبيهات جديدة"
          icon={<AlertCircle className="h-4 w-4 text-neutral-500" />}
          className="md:col-span-1"
        />
      </BentoGrid>
    </div>
  )
}
