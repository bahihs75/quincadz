'use client'

import React, { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

// Use a different reliable GeoJSON source
const geoUrl = "https://gist.githubusercontent.com/mohammed-elhaouari/1b8f5a6f6b5b5b5b5b5b/raw/algeria-wilayas.json"

// Fallback list of wilayas in case the map fails
const fallbackWilayas = [
  { id: 1, name: "Adrar" },
  { id: 2, name: "Chlef" },
  { id: 3, name: "Laghouat" },
  { id: 4, name: "Oum El Bouaghi" },
  { id: 5, name: "Batna" },
  { id: 6, name: "Béjaïa" },
  { id: 7, name: "Biskra" },
  { id: 8, name: "Béchar" },
  { id: 9, name: "Blida" },
  { id: 10, name: "Bouira" },
  { id: 11, name: "Tamanrasset" },
  { id: 12, name: "Tébessa" },
  { id: 13, name: "Tlemcen" },
  { id: 14, name: "Tiaret" },
  { id: 15, name: "Tizi Ouzou" },
  { id: 16, name: "Alger" },
  { id: 17, name: "Djelfa" },
  { id: 18, name: "Jijel" },
  { id: 19, name: "Sétif" },
  { id: 20, name: "Saïda" },
  { id: 21, name: "Skikda" },
  { id: 22, name: "Sidi Bel Abbès" },
  { id: 23, name: "Annaba" },
  { id: 24, name: "Guelma" },
  { id: 25, name: "Constantine" },
  { id: 26, name: "Médéa" },
  { id: 27, name: "Mostaganem" },
  { id: 28, name: "M'Sila" },
  { id: 29, name: "Mascara" },
  { id: 30, name: "Ouargla" },
  { id: 31, name: "Oran" },
  { id: 32, name: "El Bayadh" },
  { id: 33, name: "Illizi" },
  { id: 34, name: "Bordj Bou Arréridj" },
  { id: 35, name: "Boumerdès" },
  { id: 36, name: "El Tarf" },
  { id: 37, name: "Tindouf" },
  { id: 38, name: "Tissemsilt" },
  { id: 39, name: "El Oued" },
  { id: 40, name: "Khenchela" },
  { id: 41, name: "Souk Ahras" },
  { id: 42, name: "Tipaza" },
  { id: 43, name: "Mila" },
  { id: 44, name: "Aïn Defla" },
  { id: 45, name: "Naâma" },
  { id: 46, name: "Aïn Témouchent" },
  { id: 47, name: "Ghardaïa" },
  { id: 48, name: "Relizane" },
  { id: 49, name: "El M'ghair" },
  { id: 50, name: "El Menia" },
  { id: 51, name: "Ouled Djellal" },
  { id: 52, name: "Béni Abbès" },
  { id: 53, name: "In Salah" },
  { id: 54, name: "In Guezzam" },
  { id: 55, name: "Touggourt" },
  { id: 56, name: "Djanet" },
  { id: 57, name: "El Meghaier" },
  { id: 58, name: "El Meniaa" },
]

export default function WilayaMap({ onSelect }: { onSelect?: (wilayaId: string) => void }) {
  const [tooltip, setTooltip] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    // Check if the GeoJSON is accessible
    fetch(geoUrl)
      .then(res => {
        if (!res.ok) {
          setHasError(true)
          setUseFallback(true)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setHasError(true)
        setUseFallback(true)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400">Chargement de la carte...</p>
      </div>
    )
  }

  if (useFallback) {
    return (
      <div className="h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">Sélectionnez une wilaya:</h3>
        <div className="grid grid-cols-2 gap-2">
          {fallbackWilayas.map((w) => (
            <button
              key={w.id}
              onClick={() => onSelect?.(w.id.toString())}
              className="p-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 rounded text-right"
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-96 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2000, center: [2.5, 28] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => onSelect?.(geo.id)}
                onMouseEnter={() => setTooltip(geo.properties.name || '')}
                onMouseLeave={() => setTooltip('')}
                style={{
                  default: {
                    fill: "#D6D6DA",
                    stroke: "#FFFFFF",
                    strokeWidth: 0.5,
                    outline: "none",
                  },
                  hover: {
                    fill: "#F53",
                    stroke: "#FFFFFF",
                    strokeWidth: 0.5,
                    outline: "none",
                    cursor: "pointer",
                  },
                  pressed: {
                    fill: "#E42",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      {tooltip && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {tooltip}
        </div>
      )}
    </div>
  )
}
