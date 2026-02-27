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

// Color palette for wilayas (cycling through colors)
const colorPalette = [
  '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#D4A5A5',
  '#9B59B6', '#3498DB', '#E67E22', '#2ECC71', '#E74C3C', '#1ABC9C',
  '#F39C12', '#8E44AD', '#27AE60', '#D35400', '#C0392B', '#16A085'
]

interface WilayaMapProps {
  onSelect?: (wilayaId: string, wilayaName: string) => void
  selectedWilayaId?: string | null
}

export default function WilayaMap({ onSelect, selectedWilayaId }: WilayaMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [geojsonLayer, setGeojsonLayer] = useState<L.GeoJSON | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWilayaName, setSelectedWilayaName] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return

    const map = L.map('map', {
      center: [28.0, 2.5], // Algeria center
      zoom: 6,
      zoomControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)
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

        if (geojsonLayer) {
          mapRef.current?.removeLayer(geojsonLayer)
        }

        const colorMap = new Map()
        data.features.forEach((feature: any, index: number) => {
          colorMap.set(feature.id, colorPalette[index % colorPalette.length])
        })

        const style = (feature: any) => {
          const isSelected = selectedWilayaId === feature.id
          return {
            fillColor: isSelected ? '#FF5F15' : (colorMap.get(feature.id) || '#D6D6DA'),
            weight: isSelected ? 2 : 1,
            opacity: 1,
            color: '#FFFFFF',
            fillOpacity: 0.7,
          }
        }

        const onEachFeature = (feature: any, layer: L.Layer) => {
          const pathLayer = layer as L.Path

          pathLayer.on({
            click: () => {
              if (onSelect) {
                onSelect(feature.id, feature.properties.name)
                setSelectedWilayaName(feature.properties.name)
              }
              if (geojsonLayer) {
                geojsonLayer.resetStyle()
              }
              pathLayer.setStyle({ fillColor: '#FF5F15', weight: 2 })
            },
            mouseover: () => {
              pathLayer.bindTooltip(`
                <div style="font-weight: bold; color: #333;">
                  ${feature.properties.name}
                </div>
              `, { permanent: false, direction: 'top' }).openTooltip()
              pathLayer.setStyle({ fillOpacity: 0.9, weight: 2 })
            },
            mouseout: () => {
              pathLayer.closeTooltip()
              if (selectedWilayaId !== feature.id) {
                pathLayer.setStyle({
                  fillColor: colorMap.get(feature.id) || '#D6D6DA',
                  fillOpacity: 0.7,
                  weight: 1
                })
              } else {
                pathLayer.setStyle({ fillColor: '#FF5F15', weight: 2 })
              }
            },
          })
        }

        const layer = L.geoJSON(data, { style, onEachFeature }).addTo(mapRef.current!)
        setGeojsonLayer(layer)
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
    <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/30 z-10">
          <p className="text-yellow-800 dark:text-yellow-400 text-center px-4">{error}</p>
        </div>
      )}
      <div id="map" className="w-full h-full" />
      {selectedWilayaName && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Wilaya sélectionnée: </span>
          <span className="font-bold text-primary">{selectedWilayaName}</span>
        </div>
      )}
    </div>
  )
}
