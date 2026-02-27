'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// GeoJSON URL for Algeria wilayas (from a reliable source)
const GEOJSON_URL = 'https://raw.githubusercontent.com/oussamabouchikhi/algeria-geojson/master/wilayas.geojson'

interface WilayaMapProps {
  onSelect?: (wilayaId: string, wilayaName: string) => void
  selectedWilayaId?: string | null
}

export default function WilayaMap({ onSelect, selectedWilayaId }: WilayaMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [geojsonLayer, setGeojsonLayer] = useState<L.GeoJSON | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return

    const map = L.map('map', {
      center: [28.0, 2.5], // Algeria center
      zoom: 6,
      zoomControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Load GeoJSON and add to map
  useEffect(() => {
    if (!mapRef.current) return

    const loadGeoJSON = async () => {
      try {
        setLoading(true)
        const response = await fetch(GEOJSON_URL)
        if (!response.ok) throw new Error('Failed to load GeoJSON')
        const data = await response.json()

        // Remove previous layer if exists
        if (geojsonLayer) {
          mapRef.current?.removeLayer(geojsonLayer)
        }

        // Style function
        const style = (feature: any) => ({
          fillColor: selectedWilayaId === feature.id ? '#F53' : '#D6D6DA',
          weight: 1,
          opacity: 1,
          color: '#FFFFFF',
          fillOpacity: 0.7,
        })

        // On each feature
        const onEachFeature = (feature: any, layer: L.Layer) => {
          layer.on({
            click: () => {
              if (onSelect) {
                onSelect(feature.id, feature.properties.name)
              }
              // Highlight selected
              if (geojsonLayer) {
                geojsonLayer.resetStyle()
              }
              // Cast layer to Path to access setStyle
              (layer as L.Path).setStyle({ fillColor: '#F53' })
            },
            mouseover: () => {
              layer.bindTooltip(feature.properties.name).openTooltip()
            },
            mouseout: () => {
              layer.closeTooltip()
            },
          })
        }

        const layer = L.geoJSON(data, { style, onEachFeature }).addTo(mapRef.current!)
        setGeojsonLayer(layer)

        // Fit bounds to Algeria
        mapRef.current?.fitBounds(layer.getBounds())
      } catch (err) {
        console.error('Map error:', err)
        setError('Impossible de charger la carte. Veuillez utiliser la liste déroulante.')
      } finally {
        setLoading(false)
      }
    }

    loadGeoJSON()
  }, [selectedWilayaId, onSelect])

  return (
    <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
          <p className="text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/30 z-10">
          <p className="text-yellow-800 dark:text-yellow-400 text-center">{error}</p>
        </div>
      )}
      <div id="map" className="w-full h-full" />
    </div>
  )
}
