'use client'

import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { useState } from 'react'

export default function ProductCard({ product }: { product: any }) {
  const { addToCart, getItemQuantity } = useCart()
  const { language, t } = useLanguage()
  const [added, setAdded] = useState(false)

  const displayName = language === 'fr' && product.name_fr ? product.name_fr : product.name_ar

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

  const handleViewDetails = (e: React.MouseEvent) => {
    // Allow default link behavior
  }

  const quantityInCart = getItemQuantity(product.id)

  return (
    <div className="card group w-full max-w-[190px] mx-auto bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-primary hover:shadow-lg relative overflow-visible">
      {/* Product image link */}
      <Link href={`/client/product/${product.id}`} className="block mb-3">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              {t('no_image')}
            </div>
          )}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {t('last_items', { count: product.stock_quantity })}
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="absolute top-1 right-1 bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {t('out_of_stock')}
            </span>
          )}
        </div>
      </Link>

      {/* Product title link */}
      <Link href={`/client/product/${product.id}`} className="block mb-2">
        <h3 className="font-bold text-sm text-gray-800 dark:text-white line-clamp-2 hover:text-primary transition">
          {displayName}
        </h3>
      </Link>

      {/* Store name */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.stores?.store_name}</p>

      {/* Price */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-primary">
          {product.price.toLocaleString()} DA
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">/{product.unit}</span>
      </div>

      {/* Quantity in cart indicator */}
      {quantityInCart > 0 && (
        <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full z-10">
          {quantityInCart} {t('in_cart')}
        </div>
      )}

      {/* Buttons container - positioned absolutely at bottom, visible on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 w-[90%] flex gap-2 z-20">
        <Link
          href={`/client/product/${product.id}`}
          className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-medium py-2 px-1 rounded-lg text-center transition"
        >
          <Eye size={16} className="inline ml-1" />
          التفاصيل
        </Link>
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="flex-1 bg-primary hover:bg-secondary disabled:bg-gray-400 text-white text-sm font-medium py-2 px-1 rounded-lg transition flex items-center justify-center gap-1"
        >
          <ShoppingCart size={16} />
          أضف
        </button>
      </div>

      {/* Added confirmation toast (inline) */}
      {added && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap z-30">
          {t('added_to_cart')} ✓
        </div>
      )}
    </div>
  )
}
