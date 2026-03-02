'use client'

import { useState, useEffect } from 'react'
import { wilayas, baladiyas } from '@/lib/algeriaData'
import { useLanguage } from '@/contexts/LanguageContext'
import { MapPin, AlertCircle, X, Search } from 'lucide-react'

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
      setLocationError(t('geolocation_not_supported'))
      return
    }
    setGettingLocation(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
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
            onClose?.()
          } else {
            setSelectedWilaya(matchedWilaya.id)
            setSearchTerm('')
            setLocationError(t('location_baladiya_not_found'))
          }
        } catch (error) {
          console.error('Geolocation error:', error)
          setLocationError(t('location_error'))
        } finally {
          setGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation permission error:', error)
        let message = t('location_failed')
        if (error.code === 1) message = t('location_permission_denied')
        else if (error.code === 2) message = t('location_unavailable')
        else if (error.code === 3) message = t('location_timeout')
        setLocationError(message)
        setGettingLocation(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800"
        >
          <X size={16} />
        </button>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
            <MapPin className="h-6 w-6 text-primary dark:text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('choose_location')}</h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-secondary disabled:opacity-50"
          >
            {gettingLocation ? (
              <>
                <span className="location-loader" />
                <span>{t('detecting')}</span>
              </>
            ) : (
              <>
                <MapPin size={18} />
                <span>{t('detect_my_location')}</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500 dark:bg-gray-800 dark:text-gray-400">أو</span>
            </div>
          </div>

          {locationError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('wilaya')}</label>
            <select
              value={selectedWilaya}
              onChange={(e) => {
                setSelectedWilaya(Number(e.target.value) || '')
                setSelectedBaladiya('')
                setSearchTerm('')
                setShowDropdown(false)
              }}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('select_wilaya')}</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {language === 'fr' ? w.name_fr : w.name_ar}
                </option>
              ))}
            </select>
          </div>

          {selectedWilaya && (
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('baladiya')}</label>
              <input
                type="text"
                placeholder={t('search_baladiya')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {showDropdown && filteredBaladiyas.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {filteredBaladiyas.map((b) => (
                    <div
                      key={b.id}
                      className="cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                          onClose?.()
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
