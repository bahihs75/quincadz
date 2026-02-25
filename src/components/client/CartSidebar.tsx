'use client'

import { useCart } from '@/contexts/CartContext'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartSidebar() {
  const { cartItems, isCartOpen, closeCart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart()
  const router = useRouter()

  if (!isCartOpen) return null

  const handleCheckout = () => {
    closeCart()
    router.push('/client/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto transition-transform">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            سلة التسوق
            {getItemCount() > 0 && (
              <span className="bg-blue-600 text-white text-sm px-2 py-0.5 rounded-full">
                {getItemCount()}
              </span>
            )}
          </h2>
          <button onClick={closeCart} className="p-1 hover:bg-gray-200 rounded">
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="mb-4">سلة التسوق فارغة</p>
            <button
              onClick={closeCart}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              متابعة التسوق
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b">
                  <img
                    src={item.image}
                    alt={item.name_ar}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name_ar}</h3>
                    <p className="text-sm text-gray-500">{item.store_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">
                          {(item.price * item.quantity).toLocaleString()} دج
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between mb-4">
                <span className="font-bold">المجموع</span>
                <span className="font-bold text-blue-600">{getCartTotal().toLocaleString()} دج</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
              >
                إتمام الشراء
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
