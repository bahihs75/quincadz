import { Banknote, ClipboardList, Package } from 'lucide-react'

interface StatsCardsProps {
  products: number
  orders: number
  revenue: number
}

export default function StatsCards({ products, orders, revenue }: StatsCardsProps) {
  const stats = [
    { title: 'إجمالي المنتجات', value: products.toLocaleString('ar-DZ'), Icon: Package, accent: 'bg-[#F5C400]' },
    { title: 'إجمالي الطلبات', value: orders.toLocaleString('ar-DZ'), Icon: ClipboardList, accent: 'bg-[#111111]' },
    { title: 'الإيرادات', value: `${revenue.toLocaleString('ar-DZ')} دج`, Icon: Banknote, accent: 'bg-[#234F32]' },
  ]

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map(({ title, value, Icon, accent }) => (
        <article key={title} className="group flex items-center gap-4 border border-[#D8D4CB] bg-white p-5 shadow-[0_10px_28px_rgba(17,17,17,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(17,17,17,0.09)]">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent} ${accent === 'bg-[#F5C400]' ? 'text-[#111111]' : 'text-white'} transition-transform duration-200 group-hover:scale-105`}>
            <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#777777]">{title}</p>
            <p className="mt-1 truncate text-2xl font-extrabold tabular-nums tracking-tight text-[#111111]">{value}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
