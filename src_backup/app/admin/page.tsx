import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Store, Users, Package, ShoppingBag, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch statistics
  const [storesCount, usersCount, productsCount, ordersCount, revenueResult] = await Promise.all([
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total_amount').eq('order_status', 'delivered'),
  ])

  const revenue = revenueResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  const stats = [
    { title: 'إجمالي المتاجر', value: storesCount.count || 0, icon: Store, color: 'bg-primary' },
    { title: 'إجمالي المستخدمين', value: usersCount.count || 0, icon: Users, color: 'bg-green-500' },
    { title: 'إجمالي المنتجات', value: productsCount.count || 0, icon: Package, color: 'bg-purple-500' },
    { title: 'إجمالي الطلبات', value: ordersCount.count || 0, icon: ShoppingBag, color: 'bg-yellow-500' },
    { title: 'الإيرادات', value: `${revenue.toLocaleString()} دج`, icon: DollarSign, color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6 flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white ml-4`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
