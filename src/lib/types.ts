export type StoreSummary = {
  id: string
  store_name: string
  phone?: string | null
  address?: string | null
}

export type Category = {
  id: string
  name_ar: string
  name_fr?: string | null
  is_active?: boolean
  sort_order?: number | null
}

export type Product = {
  id: string
  name_ar: string
  name_fr?: string | null
  description_ar?: string | null
  description_fr?: string | null
  price: number
  images?: string[] | null
  store_id: string
  unit?: string | null
  stock_quantity: number
  is_available?: boolean
  stores?: StoreSummary | null
}

export type CartItem = {
  id: string
  name_ar: string
  price: number
  image: string
  store_id: string
  store_name: string
  unit: string
  max_quantity: number
  quantity: number
}

export type LocationSelection = {
  wilaya_id?: number | null
  wilaya_name: string
  baladiya_id?: number | null
  baladiya_name?: string | null
  latitude?: number | null
  longitude?: number | null
}

export type OrderGroup = {
  store_id: string
  store_name: string
  items: CartItem[]
  subtotal: number
}
