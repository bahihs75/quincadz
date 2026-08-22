'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface DirectOrderModalProps {
  product: any
  onClose: () => void
}

export default function DirectOrderModal({ product, onClose }: DirectOrderModalProps) {
  const supabase = createClient()
  const [quantity, setQuantity] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !phone || !wilaya) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const clientName = `${firstName} ${lastName}`
    const total = product.price * quantity
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      client_id: user?.id || null,
      store_id: product.store_id,
      wilaya_id: null,
      delivery_address: wilaya,
      client_phone: phone,
      client_name: clientName,
      items_total: total,
      delivery_fee: 0,
      total_amount: total,
      payment_method: 'cod',
      order_status: 'pending',
      notes: `Direct order from product page. Quantity: ${quantity}`
    })
    if (error) {
      toast.error('فشل إنشاء الطلب: ' + error.message)
    } else {
      toast.success('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.')
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/60 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md bg-[#FFFFFF] p-6 shadow-[0_24px_64px_rgba(17,17,17,0.16)]">
        <button type="button" onClick={onClose} aria-label="إغلاق الشراء المباشر" className="icon-button absolute left-4 top-4">
          <X size={19} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <h2 className="text-xl font-bold mb-4">شراء مباشر</h2>
        <p className="text-slate-600 mb-4">{product.name_ar} – {product.price} DA</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">الكمية</label>
            <input type="number" min="1" max={product.stock_quantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-sm font-medium text-slate-700">الاسم الأول *</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" required /></div>
            <div><label className="block text-sm font-medium text-slate-700">الاسم الأخير *</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700">رقم الهاتف *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">الولاية *</label><input type="text" value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="input" required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">تأكيد الطلب</button>
        </form>
      </div>
    </div>
  )
}
