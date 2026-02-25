'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import LocationSelector from '@/components/LocationSelector'
import { Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    delivery_address: '',
    wilaya_id: '',
    baladiya_id: '',
    notes: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Pre-fill with user's profile if available
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, phone')
          .eq('id', user.id)
          .single()
        if (profile) {
          setFormData(prev => ({
            ...prev,
            client_name: profile.full_name || '',
            client_phone: profile.phone || '',
          }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/login?redirect=/client/checkout')
      return
    }

    setLoading(true)

    try {
      // Create orders for each store
      for (const store of stores) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            client_id: user.id,
            store_id: store.store_id,
            wilaya_id: formData.wilaya_id ? parseInt(formData.wilaya_id) : null,
            baladiya_id: formData.baladiya_id ? parseInt(formData.baladiya_id) : null,
            delivery_address: formData.delivery_address,
            client_phone: formData.client_phone,
            client_name: formData.client_name,
            items_total: store.subtotal,
            delivery_fee: 0, // Will be calculated later
            total_amount: store.subtotal,
            payment_method: 'cod',
            order_status: 'pending',
            notes: formData.notes,
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Create order items
        const orderItems = store.items.map((item: any) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError

        // Update product stock
        for (const item of store.items) {
          await supabase.rpc('decrement_stock', {
            product_id: item.id,
            quantity: item.quantity,
          })
        }
      }

      // Clear cart and redirect to success page
      clearCart()
      router.push('/client/orders?success=true')
    } catch (error: any) {
      alert('حدث خطأ أثناء إنشاء الطلب: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black">إتمام الشراء</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-black">معلومات التوصيل</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 text-gray-700">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <LocationSelector
              onSelect={(wilayaId, baladiyaId) => {
                setFormData({
                  ...formData,
                  wilaya_id: wilayaId.toString(),
                  baladiya_id: baladiyaId.toString(),
                })
              }}
              initialWilayaId={formData.wilaya_id ? parseInt(formData.wilaya_id) : undefined}
              initialBaladiyaId={formData.baladiya_id ? parseInt(formData.baladiya_id) : undefined}
            />

            <div className="mb-4">
              <label className="block mb-1 text-gray-700">العنوان بالتفصيل *</label>
              <textarea
                required
                rows={3}
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="الشارع، رقم المبنى، الطابق، ..."
              />
            </div>

            <div className="mb-6">
              <label className="block mb-1 text-gray-700">ملاحظات إضافية (اختياري)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="أي ملاحظات للتوصيل"
              />
            </div>

            {!user && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded">
                يرجى <a href="/auth/login" className="underline">تسجيل الدخول</a> لإتمام الطلب
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !user}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
            </button>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-black">طلبك</h2>

            {stores.map((store) => (
              <div key={store.store_id} className="mb-4 pb-4 border-b last:border-0">
                <h3 className="font-bold mb-2">{store.store_name}</h3>
                {store.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>
                      {item.name_ar} x {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString()} دج</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium mt-2">
                  <span>المجموع</span>
                  <span>{store.subtotal.toLocaleString()} دج</span>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-blue-600 dark:text-blue-400">{total.toLocaleString()} دج</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">سيتم حساب تكلفة التوصيل لاحقاً</p>
              <p className="text-sm text-gray-500 mt-1">طريقة الدفع: الدفع عند الاستلام</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
