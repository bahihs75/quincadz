import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrdersClient from '@/components/store/OrdersClient'

export default async function StoreOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!store) redirect('/store/setup')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name_ar))')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">إدارة الطلبات</h1>
      <OrdersClient orders={orders || []} />
    </div>
  )
}
