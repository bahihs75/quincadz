'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { wilayas } from '@/lib/algeriaData'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface BuyNowModalProps {
  product: any
  onClose: () => void
  onSuccess: () => void
}

export default function BuyNowModal({ product, onClose, onSuccess }: BuyNowModalProps) {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedWilaya, setSelectedWilaya] = useState<number | ''>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Pre-fill from profile
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', user.id)
          .single()
        if (profile) {
          setFullName(profile.full_name || '')
          setPhone(profile.phone || '')
        }
      }
    }
    fetchUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login first')
      window.location.href = '/auth/login'
      return
    }
    if (!fullName || !phone || !selectedWilaya) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)

    // Get store info
    const { data: store } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('id', product.store_id)
      .single()

    if (!store) {
      toast.error('Store not found')
      setLoading(false)
      return
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    const total = product.price * quantity

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        client_id: user.id,
        store_id: product.store_id,
        wilaya_id: selectedWilaya,
        delivery_address: '',
        client_phone: phone,
        client_name: fullName,
        items_total: total,
        delivery_fee: 0,
        total_amount: total,
        payment_method: 'cod',
        order_status: 'pending',
        notes: `Direct buy: ${quantity} x ${product.name_ar}`,
      })
      .select()
      .single()

    if (orderError) {
      toast.error(orderError.message)
      setLoading(false)
      return
    }

    // Create order item
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      quantity,
      unit_price: product.price,
      total_price: total,
    })

    if (itemError) {
      toast.error(itemError.message)
      setLoading(false)
      return
    }

    // Decrease stock
    await supabase.rpc('decrement_stock', { product_id: product.id, quantity })

    toast.success('Order placed successfully!')
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-4">Buy Now</h2>
        <p className="text-sm text-slate-600 mb-6">{product.name_ar}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Wilaya *
            </label>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select wilaya</option>
              {wilayas.map(w => (
                <option key={w.id} value={w.id}>{w.name_ar}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border border-slate-300 rounded-lg"
              >-</button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="px-3 py-1 border border-slate-300 rounded-lg"
              >+</button>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-lg font-bold text-primary">
              Total: {(product.price * quantity).toLocaleString()} DA
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Processing...' : 'Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  )
}
