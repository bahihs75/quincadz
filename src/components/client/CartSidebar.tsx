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
        className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-[2px]"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-full overflow-y-auto bg-[#FFFFFF] shadow-[0_24px_64px_rgba(17,17,17,0.16)] transition-transform sm:w-96">
        <div className="flex items-center justify-between border-b border-[#D8D4CB] bg-[#F5F2EA] p-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag size={20} />
            سلة التسوق
            {getItemCount() > 0 && (
              <span className="rounded-full bg-[#F5C400] px-2 py-0.5 text-sm text-[#111111]">
                {getItemCount()}
              </span>
            )}
          </h2>
          <button type="button" onClick={closeCart} aria-label="إغلاق السلة" className="icon-button">
            <X size={19} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="mb-4">سلة التسوق فارغة</p>
            <button
              onClick={closeCart}
              className="btn-primary"
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
                    <p className="text-sm text-slate-500">{item.store_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="icon-button h-11 min-h-11 w-11 min-w-11"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="icon-button h-11 min-h-11 w-11 min-w-11"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {(item.price * item.quantity).toLocaleString()} دج
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="icon-button text-[#C62828] hover:text-[#C62828]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-slate-50">
              <div className="flex justify-between mb-4">
                <span className="font-bold">المجموع</span>
                <span className="font-bold text-primary">{getCartTotal().toLocaleString()} دج</span>
              </div>
              <button
                onClick={handleCheckout}
                className="btn-primary w-full min-h-12"
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
