'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Star, MapPin, Phone, Clock } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { addToCart, getItemQuantity } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, stores(*, wilayas(name_ar), baladiyas(name_ar))')
        .eq('id', id)
        .single()
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id, supabase])

  const handleAddToCart = () => {
    if (!product) return
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

  const quantityInCart = getItemQuantity(product?.id)

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">جاري التحميل...</div>
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl mb-4">المنتج غير موجود</h1>
        <Link href="/client/products" className="text-blue-600 dark:text-blue-400">
          العودة إلى المنتجات
        </Link>
      </div>
    )
  }

  const images: string[] = product.images?.length ? product.images : ['/default-product.jpg']

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Images */}
          <div>
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name_ar}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 border-2 rounded ${
                      selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-2 text-black">{product.name_ar}</h1>
            {product.name_fr && (
              <p className="text-gray-500 mb-4">{product.name_fr}</p>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex text-yellow-400">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <span className="text-gray-600">(0 تقييم)</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {product.price.toLocaleString()} دج
              </span>
              <span className="text-gray-500 mr-2">/{product.unit}</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Stock status */}
            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                product.stock_quantity <= 5 ? (
                  <span className="text-red-600 font-semibold">
                    آخر {product.stock_quantity} قطع متبقية
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold">متوفر</span>
                )
              ) : (
                <span className="text-gray-500 font-semibold">نفذ من المخزون</span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <label className="font-medium">الكمية:</label>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border-l"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock_quantity, quantity + 1))
                  }
                  className="px-3 py-1 border-r"
                >
                  +
                </button>
              </div>
              <span>الحد الأقصى: {product.min_order_quantity || 1}</span>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`w-full md:w-auto px-8 py-3 rounded-lg flex items-center justify-center gap-2 ${
                product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart size={20} />
              أضف إلى السلة
            </button>

            {quantityInCart > 0 && (
              <div className="mt-2 text-green-600">
                {quantityInCart} قطعة في سلة التسوق
              </div>
            )}

            {added && (
              <div className="mt-2 text-green-600 animate-pulse">
                تمت الإضافة إلى السلة ✓
              </div>
            )}
          </div>
        </div>

        {/* Store info */}
        {product.stores && (
          <div className="border-t p-6 bg-gray-50">
            <h2 className="text-xl font-bold mb-4 text-black">معلومات المتجر</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">{product.stores.store_name}</p>
                <p className="text-gray-600 mt-1">{product.stores.description}</p>
                {product.stores.address && (
                  <p className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    {product.stores.address}
                    {product.stores.wilayas?.name_ar &&
                      `, ${product.stores.wilayas.name_ar}`}
                    {product.stores.baladiyas?.name_ar &&
                      ` - ${product.stores.baladiyas.name_ar}`}
                  </p>
                )}
                {product.stores.phone && (
                  <p className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <Phone size={16} />
                    {product.stores.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="font-medium mb-2">ساعات العمل</p>
                {product.stores.opening_hours ? (
                  <div className="text-sm text-gray-600">
                    {Object.entries(product.stores.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span>
                          {day === 'sat' && 'السبت'}
                          {day === 'sun' && 'الأحد'}
                          {day === 'mon' && 'الإثنين'}
                          {day === 'tue' && 'الثلاثاء'}
                          {day === 'wed' && 'الأربعاء'}
                          {day === 'thu' && 'الخميس'}
                          {day === 'fri' && 'الجمعة'}
                        </span>
                        <span>
                          {typeof hours === 'string'
                            ? hours
                            : `${(hours as any).open} - ${(hours as any).close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">غير محدد</p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  نطاق التوصيل: {product.stores.delivery_radius_km} كم
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
