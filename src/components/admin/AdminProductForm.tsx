'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'

interface AdminProductFormProps {
  product?: any
  stores: { id: string; store_name: string }[]
}

export default function AdminProductForm({ product, stores }: AdminProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || [])
  const [formData, setFormData] = useState({
    store_id: product?.store_id || '',
    name_ar: product?.name_ar || '',
    name_fr: product?.name_fr || '',
    description: product?.description || '',
    price: product?.price || '',
    unit: product?.unit || 'piece',
    stock_quantity: product?.stock_quantity || '',
    min_order_quantity: product?.min_order_quantity || '1',
    category_id: product?.category_id || '',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').eq('is_active', true)
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  const onDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(f => f.size <= 1024 * 1024)
    if (validFiles.length !== acceptedFiles.length) {
      alert('بعض الصور حجمها أكبر من 1 ميغابايت وتم تجاهلها')
    }
    setImageFiles(prev => [...prev, ...validFiles])
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 1024 * 1024,
  })

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.store_id) {
      alert('الرجاء اختيار المتجر')
      setLoading(false)
      return
    }

    // Upload new images
    const uploadedUrls: string[] = []
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.store_id}/${Date.now()}-${Math.random()}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        alert('فشل رفع الصورة: ' + (uploadError.message || JSON.stringify(uploadError)))
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(urlData.publicUrl)
    }

    const existingUrls = imagePreviews.filter(url => url.startsWith('http'))
    const allImages = [...existingUrls, ...uploadedUrls]

    const productData = {
      store_id: formData.store_id,
      name_ar: formData.name_ar,
      name_fr: formData.name_fr || null,
      description: formData.description || null,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      min_order_quantity: parseInt(formData.min_order_quantity) || 1,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      images: allImages,
    }

    let error
    if (product) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData)
      error = insertError
    }

    setLoading(false)
    if (!error) {
      router.push('/admin/products')
      router.refresh()
    } else {
      alert('حدث خطأ: ' + error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 text-gray-700">المتجر *</label>
        <select
          required
          value={formData.store_id}
          onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
        >
          <option value="">اختر المتجر</option>
          {stores.map(store => (
            <option key={store.id} value={store.id}>{store.store_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-gray-700">اسم المنتج (عربي) *</label>
          <input
            type="text"
            required
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">اسم المنتج (فرنسي)</label>
          <input
            type="text"
            value={formData.name_fr}
            onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-gray-700">التصنيف *</label>
        <select
          required
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
        >
          <option value="">اختر التصنيف</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-gray-700">الوصف</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-gray-700">السعر (دج) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">الوحدة *</label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          >
            <option value="piece">قطعة</option>
            <option value="kg">كيلو</option>
            <option value="meter">متر</option>
            <option value="liter">لتر</option>
            <option value="box">صندوق</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700">الكمية في المخزون</label>
          <input
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-gray-700">الحد الأدنى للطلب</label>
        <input
          type="number"
          min="1"
          value={formData.min_order_quantity}
          onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700">صور المنتج (أقل من 1 ميغابايت لكل صورة)</label>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500"
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-600">اسحب الصور هنا أو انقر للاختيار</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
              <img src={src} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : product ? 'تحديث المنتج' : 'إضافة المنتج'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}
