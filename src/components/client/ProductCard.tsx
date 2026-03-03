'use client'

import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'

export default function ProductCard({ product }: { product: any }) {
  const { addToCart, getItemQuantity } = useCart()
  const { language, t } = useLanguage()
  const [added, setAdded] = useState(false)

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

  return (
    <div className="group card-hover bg-white rounded-lg shadow-sm overflow-hidden">
      <Link href={`/client/product/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={displayName}
              className="w-full h-full object-cover image-zoom"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
              {t('no_image')}
            </div>
          )}
        </div>
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <span className="badge badge-instock">
            {t('last_items', { count: product.stock_quantity })}
          </span>
        )}
        {product.stock_quantity === 0 && (
          <span className="badge bg-slate-500 text-white">
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
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="w-full btn-primary mt-3 disabled:opacity-50"
        >
          <ShoppingCart size={16} className="inline ml-2" />
          {t('add_to_cart')}
        </button>
        {quantityInCart > 0 && (
          <div className="text-sm text-green-600 mt-2">
            {quantityInCart} {t('in_cart')}
          </div>
        )}
        {added && (
          <div className="text-sm text-green-600 animate-pulse mt-1">
            {t('added_to_cart')} ✓
          </div>
        )}
      </div>
    </div>
  )
}
