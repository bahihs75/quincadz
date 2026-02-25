'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import LocationSelector from '@/components/LocationSelector'
import { Globe } from 'lucide-react'

const days = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الإثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
]

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00')

export default function StoreSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t, language, setLanguage } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [store, setStore] = useState<any>(null)
  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    address: '',
    delivery_radius_km: '',
    wilaya_id: '',
    baladiya_id: '',
    phone: '',
  })
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string }>>({})

  useEffect(() => {
    const fetchStore = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setStore(data)
        setFormData({
          store_name: data.store_name || '',
          description: data.description || '',
          address: data.address || '',
          delivery_radius_km: data.delivery_radius_km?.toString() || '10',
          wilaya_id: data.wilaya_id || '',
          baladiya_id: data.baladiya_id || '',
          phone: data.phone || '',
        })
        setOpeningHours(data.opening_hours || {})
      }
    }
    fetchStore()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    for (const day of days) {
      const oh = openingHours[day.key]
      if (oh && oh.open && oh.close) {
        if (oh.open >= oh.close) {
          alert(`${t('invalid_hours')} ${day.label}`)
          setLoading(false)
          return
        }
      }
    }

    const { error } = await supabase
      .from('stores')
      .update({
        store_name: formData.store_name,
        description: formData.description,
        address: formData.address,
        delivery_radius_km: parseInt(formData.delivery_radius_km),
        wilaya_id: formData.wilaya_id ? parseInt(formData.wilaya_id) : null,
        baladiya_id: formData.baladiya_id ? parseInt(formData.baladiya_id) : null,
        opening_hours: openingHours,
        phone: formData.phone,
      })
      .eq('id', store.id)

    setLoading(false)
    if (!error) {
      alert(t('settings_saved'))
      router.refresh()
    } else {
      alert(t('error_occurred') + ': ' + error.message)
    }
  }

  const updateHour = (day: string, field: 'open' | 'close', value: string) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  if (!store) return <div>{t('loading')}</div>

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">{t('store_settings')}</h1>

      {/* Language selector */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Globe size={20} />
          {t('language')}
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-4 py-2 rounded-lg border ${
              language === 'ar'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t('arabic')}
          </button>
          <button
            onClick={() => setLanguage('fr')}
            className={`px-4 py-2 rounded-lg border ${
              language === 'fr'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t('french')}
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-lg border ${
              language === 'en'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t('english')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">{t('store_name')} *</label>
            <input
              type="text"
              required
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">{t('phone')}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">{t('description')}</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">{t('address')}</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <LocationSelector
          onSelect={(wilayaId, baladiyaId) => {
            setFormData({ ...formData, wilaya_id: wilayaId.toString(), baladiya_id: baladiyaId.toString() })
          }}
          initialWilayaId={formData.wilaya_id ? parseInt(formData.wilaya_id) : undefined}
          initialBaladiyaId={formData.baladiya_id ? parseInt(formData.baladiya_id) : undefined}
        />

        <div className="mb-6">
          <label className="block mb-1 text-gray-700">{t('delivery_radius')}</label>
          <input
            type="number"
            min="1"
            value={formData.delivery_radius_km}
            onChange={(e) => setFormData({ ...formData, delivery_radius_km: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        {/* Opening Hours */}
        <div className="mb-6">
          <label className="block mb-3 text-gray-700 font-bold">{t('opening_hours')}</label>
          <div className="space-y-4">
            {days.map(day => (
              <div key={day.key} className="flex items-center gap-4">
                <span className="w-20 text-gray-600">{day.label}</span>
                <select
                  value={openingHours[day.key]?.open || ''}
                  onChange={(e) => updateHour(day.key, 'open', e.target.value)}
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">--:--</option>
                  {hours.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span>{t('to')}</span>
                <select
                  value={openingHours[day.key]?.close || ''}
                  onChange={(e) => updateHour(day.key, 'close', e.target.value)}
                  className="p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">--:--</option>
                  {hours.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                {openingHours[day.key]?.open && openingHours[day.key]?.close && openingHours[day.key].open >= openingHours[day.key].close && (
                  <span className="text-red-500 text-sm">{t('invalid_hours')}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{t('hours_help')}</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('saving') : t('save_changes')}
          </button>
        </div>
      </form>
    </div>
  )
}
