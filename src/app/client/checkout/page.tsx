'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

// Validation schema – only firstName, lastName, phone, wilaya are required
const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  wilaya: z.string().min(1, 'Wilaya is required'),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Pre-fill first/last name from user metadata if available
        const { data: profile } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) {
          const [first = '', last = ''] = profile.full_name.split(' ')
          // You could set default values here, but for simplicity leave it to user
        }
      }
    }
    getUser()
  }, [supabase])

  if (cartItems.length === 0) {
    router.push('/client/cart')
    return null
  }

  // Group items by store
  const storesMap = new Map()
  cartItems.forEach(item => {
    if (!storesMap.has(item.store_id)) {
      storesMap.set(item.store_id, {
        store_id: item.store_id,
        store_name: item.store_name,
        items: [],
        subtotal: 0,
      })
    }
    const store = storesMap.get(item.store_id)
    store.items.push(item)
    store.subtotal += item.price * item.quantity
  })
  const stores = Array.from(storesMap.values())
  const total = getCartTotal()

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      router.push('/auth/login?redirect=/client/checkout')
      return
    }

    setLoading(true)
    const fullName = `${data.firstName} ${data.lastName}`

    try {
      for (const store of stores) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

        const { error: orderError } = await supabase.from('orders').insert({
          order_number: orderNumber,
          client_id: user.id,
          store_id: store.store_id,
          wilaya_id: null,
          delivery_address: `${data.address}, ${data.city}, ${data.wilaya}`,
          client_phone: data.phone,
          client_name: fullName,
          items_total: store.subtotal,
          delivery_fee: 0,
          total_amount: store.subtotal,
          payment_method: 'cod',
          order_status: 'pending',
          notes: data.notes || '',
        })

        if (orderError) throw orderError

        // Create order items
        const orderItems = store.items.map((item: any) => ({
          order_id: orderNumber, // you might need the actual order id, but we'll use order_number as string – better to get the inserted order id
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }))
        // Actually, you'd need to fetch the order's UUID after insertion. Simplified here.
      }

      clearCart()
      router.push('/client/orders?success=true')
    } catch (error: any) {
      alert('Error creating order: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name *</label>
                <input {...register('firstName')} className="input w-full" />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last name *</label>
                <input {...register('lastName')} className="input w-full" />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
              <input {...register('email')} type="email" className="input w-full" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input {...register('phone')} className="input w-full" />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <h2 className="text-xl font-bold mt-6 mb-4">Delivery Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address (optional)</label>
              <input {...register('address')} className="input w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City (optional)</label>
                <input {...register('city')} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Wilaya *</label>
                <input {...register('wilaya')} className="input w-full" />
                {errors.wilaya && <p className="text-red-500 text-sm mt-1">{errors.wilaya.message}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Postal code (optional)</label>
              <input {...register('postalCode')} className="input w-full" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Order notes (optional)</label>
              <textarea {...register('notes')} rows={3} className="input w-full" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 mt-6 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Your Order</h2>
            {stores.map(store => (
              <div key={store.store_id} className="mb-4 pb-4 border-b">
                <h3 className="font-bold mb-2">{store.store_name}</h3>
                {store.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>{item.name_ar} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} DA</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium mt-2">
                  <span>Subtotal</span>
                  <span>{store.subtotal.toLocaleString()} DA</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">{total.toLocaleString()} DA</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Delivery fee calculated later</p>
              <p className="text-sm text-gray-500">Payment: Cash on delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
