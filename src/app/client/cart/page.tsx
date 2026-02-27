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
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">سلة التسوق فارغة</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">أضف بعض المنتجات إلى السلة للبدء</p>
        <Link
          href="/client/products"
          className="bg-primary text-white px-6 py-3 rounded-lg inline-block hover:bg-secondary"
        >
          تصفح المنتجات
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">سلة التسوق</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1">
          {stores.map((store) => (
            <div key={store.store_id} className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b dark:border-gray-700">
                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{store.store_name}</h2>
              </div>
              <div className="divide-y dark:divide-gray-700">
                {store.items.map((item: CartItem) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                      <img
                        src={item.image || '/default-product.jpg'}
                        alt={item.name_ar}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    <div className="flex-1">
                      <Link
                        href={`/client/product/${item.id}`}
                        className="font-medium hover:text-primary dark:text-gray-200 dark:hover:text-primary"
                      >
                        {item.name_ar}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.unit}</p>
                      <p className="text-primary font-bold mt-1">
                        {item.price.toLocaleString()} دج
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-gray-900 dark:text-gray-100">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.max_quantity, item.quantity + 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 text-left border-t dark:border-gray-700">
                <span className="font-medium text-gray-700 dark:text-gray-300">المجموع الجزئي: </span>
                <span className="text-primary font-bold">
                  {store.subtotal.toLocaleString()} دج
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white">ملخص الطلب</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">المجموع</span>
                <span className="text-gray-900 dark:text-white font-medium">{getCartTotal().toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>رسوم التوصيل</span>
                <span>تحسب لاحقاً</span>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-800 dark:text-gray-200">الإجمالي</span>
                <span className="text-primary">{getCartTotal().toLocaleString()} دج</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary disabled:opacity-50 transition"
            >
              {loading ? 'جاري التحميل...' : 'إتمام الشراء'}
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-red-500 dark:text-red-400 py-2 text-sm hover:underline"
            >
              إفراغ السلة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
