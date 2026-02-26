interface StatsCardsProps {
  products: number
  orders: number
  revenue: number
}

export default function StatsCards({ products, orders, revenue }: StatsCardsProps) {
  const stats = [
    { title: 'إجمالي المنتجات', value: products, icon: '📦', color: 'bg-primary' },
    { title: 'إجمالي الطلبات', value: orders, icon: '🛒', color: 'bg-green-500' },
    { title: 'الإيرادات', value: `${revenue.toLocaleString()} دج`, icon: '💰', color: 'bg-purple-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl ml-4`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-gray-600 text-sm">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
