'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'

export default function ProductCard({ product }: { product: any }) {
  const { addToCart, getItemQuantity } = useCart()
  const [added, setAdded] = useState(false)

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
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
      <Link href={`/client/product/${product.id}`}>
        <div className="relative h-48 bg-gray-200">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name_ar}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              لا توجد صورة
            </div>
          )}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              آخر {product.stock_quantity} قطع
            </span>
          )}
          {product.stock_quantity === 0 && (
            <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
              نفذ من المخزون
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/client/product/${product.id}`}>
          <h3 className="font-bold text-lg mb-1 hover:text-blue-600 line-clamp-2">
            {product.name_ar}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">{product.stores?.store_name}</p>

        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
          <span className="text-xs text-gray-500 mr-1">(0)</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-blue-600">
              {product.price.toLocaleString()} دج
            </span>
            <span className="text-sm text-gray-500 mr-1">/{product.unit}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={`p-2 rounded-full ${
              product.stock_quantity === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {quantityInCart > 0 && (
          <div className="mt-2 text-sm text-green-600">
            {quantityInCart} في السلة
          </div>
        )}

        {added && (
          <div className="mt-2 text-sm text-green-600 animate-pulse">
            تمت الإضافة ✓
          </div>
        )}
      </div>
    </div>
  )
}
