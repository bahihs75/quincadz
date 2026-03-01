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
  const price = product.price.toLocaleString()

  const handleAddToCart = () => {
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

  const quantityInCart = getItemQuantity(product.id)

  return (
    <div className="product-card">
      <div className="card-details">
        {/* Product image as background or top? In this design we have no image, but we can add a placeholder */}
        <div className="text-title">{displayName}</div>
        <div className="text-body">
          {price} DA / {product.unit}
        </div>
        <div className="text-body">{product.stores?.store_name}</div>
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <div className="text-sm text-red-500">{t('last_items', { count: product.stock_quantity })}</div>
        )}
        {product.stock_quantity === 0 && (
          <div className="text-sm text-gray-500">{t('out_of_stock')}</div>
        )}
        {quantityInCart > 0 && (
          <div className="text-sm text-green-600">{quantityInCart} {t('in_cart')}</div>
        )}
        {added && (
          <div className="text-sm text-green-600 animate-pulse">{t('added_to_cart')} ✓</div>
        )}
      </div>
      <div className="button-group">
        <Link href={`/client/product/${product.id}`}>
          <button className="card-button secondary">
            <Eye size={16} className="inline mr-1" />
            {t('details')}
          </button>
        </Link>
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="card-button"
        >
          <ShoppingCart size={16} className="inline mr-1" />
          {t('add_to_cart')}
        </button>
      </div>
    </div>
  )
}
