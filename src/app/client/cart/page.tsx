'use client'

import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface CartItem {
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

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const storesMap = new Map<string, {
    store_id: string
    store_name: string
    items: CartItem[]
    subtotal: number
  }>()

  cartItems.forEach((item: CartItem) => {
    if (!storesMap.has(item.store_id)) {
      storesMap.set(item.store_id, {
        store_id: item.store_id,
        store_name: item.store_name,
        items: [],
        subtotal: 0,
      })
    }
    const store = storesMap.get(item.store_id)!
    store.items.push(item)
    store.subtotal += item.price * item.quantity
  })
  const stores = Array.from(storesMap.values())

  const handleCheckout = () => {
    setLoading(true)
    router.push('/client/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-black">سلة التسوق فارغة</h1>
        <p className="text-gray-600 mb-8">أضف بعض المنتجات إلى السلة للبدء</p>
        <Link
          href="/client/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block hover:bg-blue-700"
        >
          تصفح المنتجات
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black">سلة التسوق</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1">
          {stores.map((store) => (
            <div key={store.store_id} className="bg-white rounded-lg shadow mb-6 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h2 className="font-bold text-lg">{store.store_name}</h2>
              </div>
              <div className="divide-y">
                {store.items.map((item: CartItem) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                      <img
                        src={item.image || '/default-product.jpg'}
                        alt={item.name_ar}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/client/product/${item.id}`}
                        className="font-medium hover:text-blue-600 dark:text-blue-400"
                      >
                        {item.name_ar}
                      </Link>
                      <p className="text-sm text-gray-500">{item.unit}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                        {item.price.toLocaleString()} دج
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.max_quantity, item.quantity + 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 px-6 py-3 text-left border-t">
                <span className="font-medium">المجموع الجزئي: </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {store.subtotal.toLocaleString()} دج
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-black">ملخص الطلب</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>المجموع</span>
                <span>{getCartTotal().toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>رسوم التوصيل</span>
                <span>تحسب لاحقاً</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-blue-600 dark:text-blue-400">{getCartTotal().toLocaleString()} دج</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'جاري التحميل...' : 'إتمام الشراء'}
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-red-500 py-2 text-sm hover:underline"
            >
              إفراغ السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
