import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsCards from '@/components/store/StatsCards'
import RecentOrders from '@/components/store/RecentOrders'

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

  const [productsCount, ordersCount, totalRevenue] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', store.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', store.id),
    supabase.from('orders').select('total_amount').eq('store_id', store.id).eq('order_status', 'delivered'),
  ])

  const revenue = totalRevenue.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black">لوحة التحكم</h1>
      <StatsCards
        products={productsCount.count || 0}
        orders={ordersCount.count || 0}
        revenue={revenue}
      />
      <RecentOrders storeId={store.id} />
    </div>
  )
}
