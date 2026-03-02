'use client'

import { useState, useEffect } from 'react'
import { wilayas, baladiyas } from '@/lib/algeriaData'
import { useLanguage } from '@/contexts/LanguageContext'
import { MapPin, AlertCircle, X, Search } from 'lucide-react'
import usePlacesAutocomplete from 'use-places-autocomplete'
import { geocodeByAddress, getLatLng } from 'react-google-maps'

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
  const [useGoogle, setUseGoogle] = useState(false)

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'dz' } }, // Restrict to Algeria
    debounce: 300,
  })

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

  const handleGoogleSelect = async (description: string) => {
    setValue(description, false)
    clearSuggestions()
    try {
      const results = await geocodeByAddress(description)
      const latLng = await getLatLng(results[0])
      const addressComponents = results[0].address_components
      
      // Extract wilaya and baladiya from address components
      // This depends on Google's address format; we may need to map.
      // For now, we'll just use the coordinates and reverse geocode via Nominatim as fallback.
      // A simpler approach: use the coordinates and then use Nominatim as we already have.
      // But to fully integrate, we'd need to map Google's address components to our wilayas.
      
      // Fallback: use Nominatim with the coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latLng.lat}&lon=${latLng.lng}&accept-language=fr`
      )
      const data = await response.json()
      const address = data.address
      const wilayaName = address.state || address.region || ''
      const baladiyaName = address.city || address.town || address.village || ''

      const matchedWilaya = wilayas.find(w => 
        wilayaName.includes(w.name_ar) || w.name_ar.includes(wilayaName) ||
        wilayaName.includes(w.name_fr) || w.name_fr.includes(wilayaName)
      )
      if (!matchedWilaya) {
        setLocationError('Wilaya not found')
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
        onLocationSelect({
          wilaya_id: matchedWilaya.id,
          wilaya_name: matchedWilaya.name_ar,
          baladiya_id: matchedBaladiya.id,
          baladiya_name: matchedBaladiya.name_ar,
          latitude: latLng.lat,
          longitude: latLng.lng
        })
        onClose?.()
      } else {
        setLocationError('Could not determine baladiya')
      }
    } catch (error) {
      console.error('Google Places error:', error)
      setLocationError('Error selecting location')
    }
  }

  return (
    <div className="relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 z-10"
        >
          <X size={16} />
        </button>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <MapPin className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('choose_location')}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white font-medium py-3 px-4 rounded-xl transition disabled:opacity-50"
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
            <button
              onClick={() => setUseGoogle(!useGoogle)}
              className={`px-4 py-3 rounded-xl border transition ${
                useGoogle ? 'bg-primary text-white border-primary' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title="Search with Google"
            >
              <Search size={20} />
            </button>
          </div>

          {useGoogle && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Rechercher une adresse
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!ready}
                placeholder="Entrez une adresse..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {status === 'OK' && (
                <ul className="mt-2 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                  {data.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleGoogleSelect(suggestion.description)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">أو</span>
            </div>
          </div>

          {locationError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('wilaya')}</label>
            <select
              value={selectedWilaya}
              onChange={(e) => {
                setSelectedWilaya(Number(e.target.value) || '')
                setSelectedBaladiya('')
                setSearchTerm('')
                setShowDropdown(false)
              }}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t('select_wilaya')}</option>
              {wilayas.map(w => (
                <option key={w.id} value={w.id}>{language === 'fr' ? w.name_fr : w.name_ar}</option>
              ))}
            </select>
          </div>

          {selectedWilaya && (
            <div className="relative">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t('baladiya')}</label>
              <input
                type="text"
                placeholder={t('search_baladiya')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {showDropdown && filteredBaladiyas.length > 0 && (
                <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                  {filteredBaladiyas.map(b => (
                    <div
                      key={b.id}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white"
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
