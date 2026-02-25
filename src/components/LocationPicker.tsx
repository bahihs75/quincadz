'use client'

import { useState, useEffect } from 'react'
import { wilayas, baladiyas } from '@/lib/algeriaData'
import { MapPin, Locate } from 'lucide-react'

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

  const filteredBaladiyas = baladiyas
    .filter(b => b.wilaya_id === selectedWilaya)
    .filter(b => b.name_ar.includes(searchTerm) || b.name_fr.includes(searchTerm))

  const getCurrentLocation = () => {
    setGettingLocation(true)
    setLocationError('')
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع')
      setGettingLocation(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Reverse geocode using a free service (Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          )
          const data = await response.json()
          const address = data.address
          let wilayaName = address.state || address.region || ''
          let baladiyaName = address.city || address.town || address.village || ''

          // Find matching wilaya and baladiya in our data
          const matchedWilaya = wilayas.find(w => 
            wilayaName.includes(w.name_ar) || w.name_ar.includes(wilayaName)
          )
          const matchedBaladiya = matchedWilaya
            ? baladiyas.find(b => 
                b.wilaya_id === matchedWilaya.id && 
                (baladiyaName.includes(b.name_ar) || b.name_ar.includes(baladiyaName))
              )
            : null

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
            setLocationError('لم نتمكن من تحديد موقعك بدقة، الرجاء الاختيار يدوياً')
          }
        } catch (error) {
          setLocationError('حدث خطأ أثناء تحديد الموقع')
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        setLocationError('الرجاء السماح بالوصول إلى الموقع أو الاختيار يدوياً')
        setGettingLocation(false)
      }
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black">اختر موقعك</h2>
        <button
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="flex items-center gap-2 text-primary hover:text-blue-800 disabled:opacity-50"
        >
          <Locate size={18} />
          {gettingLocation ? 'جاري التحديد...' : 'تحديد موقعي الحالي'}
        </button>
      </div>

      {locationError && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
          {locationError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-700">الولاية</label>
          <select
            value={selectedWilaya}
            onChange={(e) => {
              setSelectedWilaya(Number(e.target.value) || '')
              setSelectedBaladiya('')
              setSearchTerm('')
              setShowDropdown(false)
            }}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
          >
            <option value="">اختر الولاية</option>
            {wilayas.map(w => (
              <option key={w.id} value={w.id}>{w.name_ar}</option>
            ))}
          </select>
        </div>

        {selectedWilaya && (
          <div className="relative">
            <label className="block mb-1 text-gray-700">البلدية</label>
            <input
              type="text"
              placeholder="ابحث عن البلدية..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary text-black"
            />
            {showDropdown && filteredBaladiyas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                {filteredBaladiyas.map(b => (
                  <div
                    key={b.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer text-black"
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
