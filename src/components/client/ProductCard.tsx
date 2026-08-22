'use client'

import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Product } from '@/lib/types'
import Link from 'next/link'
import { ShoppingCart, Zap } from 'lucide-react'
import { useState } from 'react'
import DirectOrderModal from './DirectOrderModal'

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, getItemQuantity } = useCart()
  const { t } = useLanguage()
  const [added, setAdded] = useState(false)
  const [showDirectModal, setShowDirectModal] = useState(false)

  const displayName = product.name_fr || product.name_ar
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
      store_name: product.stores?.store_name || 'Local store',
      unit: product.unit || 'unit',
      max_quantity: product.stock_quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDirectModal(true)
  }

  return (
    <>
      <article className="group overflow-hidden border border-[#e4e1dc] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d96b27]/40 hover:shadow-[0_8px_24px_rgba(62,45,31,0.07)]">
        <Link href={`/client/product/${product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={displayName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#efede8] text-sm text-[#6f6d68]">{t('no_image')}</div>
            )}
          </div>
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="absolute top-2 right-2 badge badge-success">{t('last_items', { count: product.stock_quantity })}</span>
          )}
          {product.stock_quantity === 0 && (
            <span className="absolute top-2 right-2 badge bg-slate-200 text-slate-700">{t('out_of_stock')}</span>
          )}
        </Link>

        <div className="p-4">
          <Link href={`/client/product/${product.id}`}>
            <h3 className="font-bold text-lg text-slate-800 line-clamp-2 hover:text-primary transition-colors">{displayName}</h3>
          </Link>
          <p className="text-sm text-slate-500 mt-1">{product.stores?.store_name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary">{product.price.toLocaleString()} DA</span>
            <span className="text-sm text-slate-400">/{product.unit}</span>
          </div>

          <div className="flex gap-2 mt-3">
            <button aria-label={`${t('add_to_cart')}: ${displayName}`} onClick={handleAddToCart} disabled={product.stock_quantity === 0} className="btn-primary flex-1">
              <ShoppingCart size={16} className="inline ml-2" /> {t('add_to_cart')}
            </button>
            <button aria-label={`Buy now: ${displayName}`} onClick={handleBuyNow} disabled={product.stock_quantity === 0} className="flex-1 rounded-md bg-[#171717] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#333] disabled:opacity-50">
              <Zap size={16} className="inline ml-1" /> شراء مباشر
            </button>
          </div>

          {quantityInCart > 0 && <div className="text-sm text-emerald-600 mt-2">{quantityInCart} {t('in_cart')}</div>}
          {added && <div className="text-sm text-emerald-600 animate-pulse mt-1">{t('added_to_cart')} ✓</div>}
        </div>
      </article>

      {showDirectModal && <DirectOrderModal product={product} onClose={() => setShowDirectModal(false)} />}
    </>
  )
}
