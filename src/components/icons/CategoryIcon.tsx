import { Cable, CircleDashed, Hammer, Package, Paintbrush, ShieldCheck, Wrench } from 'lucide-react'

const categoryIcons = {
  package: Package,
  tools: Wrench,
  hardware: Hammer,
  paint: Paintbrush,
  safety: ShieldCheck,
  electrical: Cable,
} as const

type CategoryIconKey = keyof typeof categoryIcons

type CategoryIconProps = {
  name?: string | null
  size?: number
  className?: string
}

export const categoryIconOptions: Array<{ value: CategoryIconKey; label: string }> = [
  { value: 'package', label: 'منتجات عامة' },
  { value: 'tools', label: 'أدوات' },
  { value: 'hardware', label: 'عدد ومستلزمات' },
  { value: 'paint', label: 'دهان وتشطيب' },
  { value: 'safety', label: 'سلامة وحماية' },
  { value: 'electrical', label: 'كهرباء' },
]

export default function CategoryIcon({ name, size = 20, className = '' }: CategoryIconProps) {
  const Icon = categoryIcons[(name || 'package') as CategoryIconKey] || Package
  return <Icon size={size} strokeWidth={1.8} className={className} aria-hidden="true" />
}
