'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import type { OrderGroup } from '@/lib/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'Phone number is required'),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  wilaya: z.string().trim().min(1, 'Wilaya is required'),
  postalCode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      wilaya: '',
      postalCode: '',
      notes: '',
    },
  })

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authenticatedUser } } = await supabase.auth.getUser()
      setUser(authenticatedUser)

      if (!authenticatedUser) return

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, phone')
        .eq('id', authenticatedUser.id)
        .single()

      if (profile?.full_name) {
        const [firstName = '', ...lastNameParts] = profile.full_name.trim().split(/\s+/)
        setValue('firstName', firstName)
        setValue('lastName', lastNameParts.join(' '))
      }
      if (profile?.phone) setValue('phone', profile.phone)
      if (authenticatedUser.email) setValue('email', authenticatedUser.email)
    }

    void loadUser()
  }, [setValue, supabase])

  useEffect(() => {
    if (cartItems.length === 0) router.replace('/client/cart')
  }, [cartItems.length, router])

  const stores = useMemo<OrderGroup[]>(() => {
    const storesMap = new Map<string, OrderGroup>()
    for (const item of cartItems) {
      const current = storesMap.get(item.store_id)
      if (current) {
        current.items.push(item)
        current.subtotal += item.price * item.quantity
        continue
      }
      storesMap.set(item.store_id, {
        store_id: item.store_id,
        store_name: item.store_name,
        items: [item],
        subtotal: item.price * item.quantity,
      })
    }
    return Array.from(storesMap.values())
  }, [cartItems])

  const total = getCartTotal()

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      router.push('/auth/login?redirect=/client/checkout')
      return
    }

    setLoading(true)
    setSubmitError('')
    const createdOrderIds: string[] = []
    const fullName = `${data.firstName} ${data.lastName}`.trim()

    try {
      for (const store of stores) {
        const orderNumber = `QD-${crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            client_id: user.id,
            store_id: store.store_id,
            wilaya_id: null,
            delivery_address: [data.address, data.city, data.wilaya].filter(Boolean).join(', '),
            client_phone: data.phone,
            client_name: fullName,
            items_total: store.subtotal,
            delivery_fee: 0,
            total_amount: store.subtotal,
            payment_method: 'cod',
            order_status: 'pending',
            notes: data.notes || '',
          })
          .select('id')
          .single()

        if (orderError) throw orderError
        if (!order) throw new Error('The order could not be created.')
        createdOrderIds.push(order.id)

        const orderItems = store.items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }))
        const { error: itemError } = await supabase.from('order_items').insert(orderItems)
        if (itemError) throw itemError

        for (const item of store.items) {
          const { error: stockError } = await supabase.rpc('decrement_stock', {
            product_id: item.id,
            quantity: item.quantity,
          })
          if (stockError) throw stockError
        }
      }

      clearCart()
      router.push('/client/orders?success=true')
    } catch (error) {
      if (createdOrderIds.length > 0) {
        await supabase.from('orders').delete().in('id', createdOrderIds)
      }
      const message = error instanceof Error ? error.message : 'We could not place your order.'
      setSubmitError(`Order failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) return null

  return (
    <div className="container py-10">
      <div className="mb-8 border-b border-[#e4e1dc] pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#d96b27]">ORDER / FINAL CHECK</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#171717]">Checkout</h1>
        <p className="mt-2 text-sm text-[#6f6d68]">Confirm your delivery details. Payment is collected on delivery.</p>
      </div>

      {submitError && (
        <div role="alert" className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form onSubmit={handleSubmit(onSubmit)} className="border border-[#e4e1dc] bg-white p-6 sm:p-8">
          <section>
            <h2 className="text-xl font-bold text-[#171717]">Contact information</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="First name *" error={errors.firstName?.message}>
                <input {...register('firstName')} className="input w-full" autoComplete="given-name" />
              </Field>
              <Field label="Last name *" error={errors.lastName?.message}>
                <input {...register('lastName')} className="input w-full" autoComplete="family-name" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Email (optional)" error={errors.email?.message}>
                <input {...register('email')} type="email" className="input w-full" autoComplete="email" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Phone *" error={errors.phone?.message}>
                <input {...register('phone')} type="tel" className="input w-full" autoComplete="tel" />
              </Field>
            </div>
          </section>

          <section className="mt-10 border-t border-[#e4e1dc] pt-8">
            <h2 className="text-xl font-bold text-[#171717]">Delivery address</h2>
            <div className="mt-5">
              <Field label="Address (optional)" error={errors.address?.message}>
                <input {...register('address')} className="input w-full" autoComplete="street-address" />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="City (optional)" error={errors.city?.message}>
                <input {...register('city')} className="input w-full" autoComplete="address-level2" />
              </Field>
              <Field label="Wilaya *" error={errors.wilaya?.message}>
                <input {...register('wilaya')} className="input w-full" autoComplete="address-level1" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Postal code (optional)" error={errors.postalCode?.message}>
                <input {...register('postalCode')} className="input w-full" autoComplete="postal-code" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Order notes (optional)" error={errors.notes?.message}>
                <textarea {...register('notes')} rows={3} className="input w-full" />
              </Field>
            </div>
          </section>

          <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
            {loading ? <Loader2 className="animate-spin" aria-label="Submitting" /> : 'Place order'}
          </button>
        </form>

        <aside className="h-fit border border-[#e4e1dc] bg-white p-6 lg:sticky lg:top-24">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#6f6d68]">SUMMARY</p>
          <h2 className="mt-2 text-xl font-bold text-[#171717]">Your order</h2>
          <div className="mt-6 space-y-6">
            {stores.map((store) => (
              <div key={store.store_id} className="border-b border-[#e4e1dc] pb-5 last:border-b-0 last:pb-0">
                <h3 className="font-bold text-[#171717]">{store.store_name}</h3>
                <div className="mt-3 space-y-2">
                  {store.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm text-[#6f6d68]">
                      <span>{item.name_ar} × {item.quantity}</span>
                      <span className="shrink-0 font-mono text-[#171717]">{(item.price * item.quantity).toLocaleString()} DA</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-sm font-bold text-[#171717]">
                  <span>Subtotal</span>
                  <span>{store.subtotal.toLocaleString()} DA</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t-2 border-[#171717] pt-4">
            <div className="flex justify-between text-lg font-extrabold text-[#171717]">
              <span>Total</span>
              <span className="font-mono text-[#d96b27]">{total.toLocaleString()} DA</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#6f6d68]">Delivery fee will be confirmed by the store. Payment method: cash on delivery.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-[#171717]">{label}</label>
      {children}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
