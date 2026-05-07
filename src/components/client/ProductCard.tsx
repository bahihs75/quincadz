'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { ShoppingCart, Zap } from 'lucide-react'
import BuyNowModal from '@/components/client/BuyNowModal'

export default function ProductCard({ product }: { product: any }) {
  const { addToCart, getItemQuantity } = useCart()
  const { language, t } = useLanguage()
  const [added, setAdded] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)

  const displayName = language === 'fr' && product.name_fr ? product.name_fr : product.name_ar
  const quantityInCart = getItemQuantity(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name_ar: product.name_ar,
      price: product.price,
      image: product.images?.[0] || '/default-product.jpg',
      store_id: product.store_id,
      store_name: product.stores?.store_name,
      unit: product.unit,
      max_quantity: product.stock_quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowBuyModal(true)
  }

  return (
    <>
      <div className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <Link href={`/client/product/${product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={displayName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                {t('no_image')}
              </div>
            )}
          </div>
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="absolute top-2 right-2 badge badge-success">
              {t('last_items', { count: product.stock_quantity })}
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="absolute top-2 right-2 badge bg-slate-200 text-slate-700">
              {t('out_of_stock')}
            </span>
          )}
        </Link>

        <div className="p-4">
          <Link href={`/client/product/${product.id}`}>
            <h3 className="font-bold text-lg text-slate-800 line-clamp-2 hover:text-primary transition-colors">
              {displayName}
            </h3>
          </Link>
          <p className="text-sm text-slate-500 mt-1">{product.stores?.store_name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString()} DA
            </span>
            <span className="text-sm text-slate-400">/{product.unit}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              <ShoppingCart size={16} className="inline ml-1" />
              {t('add_to_cart')}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <Zap size={16} />
              Buy Now
            </button>
          </div>
          {quantityInCart > 0 && (
            <div className="text-sm text-emerald-600 mt-2">
              {quantityInCart} {t('in_cart')}
            </div>
          )}
          {added && (
            <div className="text-sm text-emerald-600 animate-pulse mt-1">
              {t('added_to_cart')} ✓
            </div>
          )}
        </div>
      </div>

      {showBuyModal && (
        <BuyNowModal
          product={product}
          onClose={() => setShowBuyModal(false)}
          onSuccess={() => {
            // Force refresh of cart count? Not needed for buy now.
          }}
        />
      )}
    </>
  )
}
