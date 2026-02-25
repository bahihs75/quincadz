'use client'

import { useState, useEffect } from 'react'
import { wilayas, baladiyas } from '@/lib/algeriaData'
import { MapPin, Locate, AlertCircle } from 'lucide-react'

interface Props {
  onLocationSelect: (location: {
    wilaya_id: number
    wilaya_name: string
    baladiya_id: number
    baladiya_name: string
    latitude?: number
    longitude?: number
  }) => void
  initialLocation?: any
}

export default function LocationPicker({ onLocationSelect, initialLocation }: Props) {
  const [selectedWilaya, setSelectedWilaya] = useState<number | ''>(initialLocation?.wilaya_id || '')
  const [selectedBaladiya, setSelectedBaladiya] = useState<number | ''>(initialLocation?.baladiya_id || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const filteredBaladiyas = baladiyas
    .filter(b => b.wilaya_id === selectedWilaya)
    .filter(b => b.name_ar.includes(searchTerm) || b.name_fr.includes(searchTerm))

  const getCurrentLocation = () => {
    if (!isClient) return
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع')
      return
    }

    setGettingLocation(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Try to get city/region using reverse geocoding
          // You can replace this with a more reliable service like Google Maps Geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          )
          if (!response.ok) throw new Error('Geocoding service error')
          const data = await response.json()
          const address = data.address
          const wilayaName = address.state || address.region || ''
          const baladiyaName = address.city || address.town || address.village || ''

          // Find matching wilaya and baladiya in our data
          const matchedWilaya = wilayas.find(w => 
            wilayaName.includes(w.name_ar) || w.name_ar.includes(wilayaName)
          )
          if (!matchedWilaya) {
            setLocationError('لم نتمكن من تحديد الولاية، الرجاء الاختيار يدوياً')
            setGettingLocation(false)
            return
          }

          const matchedBaladiya = baladiyas.find(b => 
            b.wilaya_id === matchedWilaya.id && 
            (baladiyaName.includes(b.name_ar) || b.name_ar.includes(baladiyaName))
          )

          if (matchedWilaya && matchedBaladiya) {
            setSelectedWilaya(matchedWilaya.id)
            setSelectedBaladiya(matchedBaladiya.id)
            setSearchTerm(matchedBaladiya.name_ar)
            onLocationSelect({
              wilaya_id: matchedWilaya.id,
              wilaya_name: matchedWilaya.name_ar,
              baladiya_id: matchedBaladiya.id,
              baladiya_name: matchedBaladiya.name_ar,
              latitude,
              longitude
            })
          } else {
            // If no exact baladiya match, at least set the wilaya
            setSelectedWilaya(matchedWilaya.id)
            setSearchTerm('')
            setLocationError('تم تحديد الولاية، الرجاء اختيار البلدية يدوياً')
          }
        } catch (error) {
          console.error('Geolocation error:', error)
          setLocationError('حدث خطأ أثناء تحديد الموقع. حاول مرة أخرى أو اختر يدوياً.')
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation permission error:', error)
        let message = 'فشل تحديد الموقع'
        if (error.code === 1) message = 'الرجاء السماح بالوصول إلى الموقع'
        else if (error.code === 2) message = 'خدمة الموقع غير متوفرة'
        else if (error.code === 3) message = 'انتهت مهلة تحديد الموقع'
        setLocationError(message)
        setGettingLocation(false)
      },
      { timeout: 10000, maximumAge: 60000 } // 10s timeout, accept cached positions up to 1 minute
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black dark:text-white">اختر موقعك</h2>
        <button
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="flex items-center gap-2 text-primary hover:text-secondary disabled:opacity-50"
        >
          <Locate size={18} />
          {gettingLocation ? 'جاري التحديد...' : 'تحديد موقعي الحالي'}
        </button>
      </div>

      {locationError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">الولاية</label>
          <select
            value={selectedWilaya}
            onChange={(e) => {
              setSelectedWilaya(Number(e.target.value) || '')
              setSelectedBaladiya('')
              setSearchTerm('')
              setShowDropdown(false)
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-black dark:text-white"
          >
            <option value="">اختر الولاية</option>
            {wilayas.map(w => (
              <option key={w.id} value={w.id}>{w.name_ar}</option>
            ))}
          </select>
        </div>

        {selectedWilaya && (
          <div className="relative">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">البلدية</label>
            <input
              type="text"
              placeholder="ابحث عن البلدية..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            {showDropdown && filteredBaladiyas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredBaladiyas.map(b => (
                  <div
                    key={b.id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-black dark:text-white"
                    onClick={() => {
                      setSearchTerm(b.name_ar)
                      setShowDropdown(false)
                      setSelectedBaladiya(b.id)
                      const wilaya = wilayas.find(w => w.id === selectedWilaya)
                      if (wilaya) {
                        onLocationSelect({
                          wilaya_id: wilaya.id,
                          wilaya_name: wilaya.name_ar,
                          baladiya_id: b.id,
                          baladiya_name: b.name_ar
                        })
                      }
                    }}
                  >
                    {b.name_ar}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
