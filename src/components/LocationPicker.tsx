'use client'

import { useState } from 'react'
import { wilayas, baladiyas } from '@/lib/algeriaData'
import { useLanguage } from '@/contexts/LanguageContext'
import type { LocationSelection } from '@/lib/types'
import { MapPin, Locate, AlertCircle, X } from 'lucide-react'

interface Props {
  onLocationSelect: (location: {
    wilaya_id: number
    wilaya_name: string
    baladiya_id: number
    baladiya_name: string
    latitude?: number
    longitude?: number
  }) => void
  initialLocation?: Partial<LocationSelection> | null
  onClose?: () => void
}

export default function LocationPicker({ onLocationSelect, initialLocation, onClose }: Props) {
  const { t, language } = useLanguage()
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
    if (typeof navigator === 'undefined') return
    if (!navigator.geolocation) {
      setLocationError(t('geolocation_not_supported'))
      return
    }
    setGettingLocation(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Simple reverse geocoding (Nominatim)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
          )
          if (!response.ok) throw new Error('Geocoding service error')
          const data = await response.json()
          const address = data.address
          const wilayaName = address.state || address.region || ''
          const baladiyaName = address.city || address.town || address.village || ''

          const matchedWilaya = wilayas.find(w => 
            wilayaName.includes(w.name_ar) || w.name_ar.includes(wilayaName) ||
            wilayaName.includes(w.name_fr) || w.name_fr.includes(wilayaName)
          )
          if (!matchedWilaya) {
            setLocationError(t('location_wilaya_not_found'))
            setGettingLocation(false)
            return
          }

          const matchedBaladiya = baladiyas.find(b => 
            b.wilaya_id === matchedWilaya.id && 
            (baladiyaName.includes(b.name_ar) || b.name_ar.includes(baladiyaName) ||
             baladiyaName.includes(b.name_fr) || b.name_fr.includes(baladiyaName))
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
            if (onClose) onClose()
          } else {
            setSelectedWilaya(matchedWilaya.id)
            setSearchTerm('')
            setLocationError(t('location_baladiya_not_found'))
          }
        } catch (error) {
          console.error(error)
          setLocationError(t('location_error'))
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        let message = t('location_failed')
        if (error.code === 1) message = t('location_permission_denied')
        else if (error.code === 2) message = t('location_unavailable')
        else if (error.code === 3) message = t('location_timeout')
        setLocationError(message)
        setGettingLocation(false)
      }
    )
  }

  return (
    <div className="relative">
      {onClose && (
        <button onClick={onClose} className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
          <X size={16} />
        </button>
      )}
      <div className="border border-[#D8D4CB] bg-[#FFFFFF] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.12)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-md bg-[#F5C400]/20 p-3">
            <MapPin className="h-6 w-6 text-[#F5C400]" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{t('choose_location')}</h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#F5C400] px-4 py-3 font-medium text-[#111111] transition hover:bg-[#FFD21F] disabled:opacity-50"
          >
            {gettingLocation ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('detecting')}</span>
              </>
            ) : (
              <>
                <Locate size={18} />
                <span>{t('detect_my_location')}</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D8D4CB]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#FFFFFF] px-3 text-[#777777]">أو</span>
            </div>
          </div>

          {locationError && (
            <div role="alert" className="flex items-start gap-2 rounded-md border border-[#C62828]/30 bg-[#C62828]/10 p-3 text-sm text-[#C62828]">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{t('wilaya')}</label>
            <select
              value={selectedWilaya}
              onChange={(e) => {
                setSelectedWilaya(Number(e.target.value) || '')
                setSelectedBaladiya('')
                setSearchTerm('')
                setShowDropdown(false)
              }}
              className="input w-full"
            >
              <option value="">{t('select_wilaya')}</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>{language === 'fr' ? w.name_fr : w.name_ar}</option>
              ))}
            </select>
          </div>

          {selectedWilaya && (
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700">{t('baladiya')}</label>
              <input
                type="text"
                placeholder={t('search_baladiya')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="input w-full"
              />
              {showDropdown && filteredBaladiyas.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[#D8D4CB] bg-[#FFFFFF] shadow-[0_12px_24px_rgba(17,17,17,0.1)]">
                  {filteredBaladiyas.map((b) => (
                    <div
                      key={b.id}
                      className="min-h-11 cursor-pointer p-3 transition-colors hover:bg-[#F5F2EA]"
                      onClick={() => {
                        setSearchTerm(b.name_ar)
                        setShowDropdown(false)
                        setSelectedBaladiya(b.id)
                        const wilaya = wilayas.find((w) => w.id === selectedWilaya)
                        if (wilaya) {
                          onLocationSelect({
                            wilaya_id: wilaya.id,
                            wilaya_name: wilaya.name_ar,
                            baladiya_id: b.id,
                            baladiya_name: b.name_ar,
                          })
                          if (onClose) onClose()
                        }
                      }}
                    >
                      {language === 'fr' && b.name_fr ? b.name_fr : b.name_ar}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
