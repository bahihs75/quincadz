'use client'

import React, { useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

// Use a reliable GeoJSON source for Algeria's wilayas (from official data)
const geoUrl = "https://raw.githubusercontent.com/oussamabouchikhi/algeria-geojson/master/wilayas.geojson"

export default function WilayaMap({ onSelect }: { onSelect?: (wilayaId: string) => void }) {
  const [tooltip, setTooltip] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if the GeoJSON is accessible
    fetch(geoUrl)
      .then(res => {
        if (!res.ok) {
          setHasError(true)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setHasError(true)
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

  if (hasError) {
    return (
      <div className="h-96 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-400 text-center">
          La carte n'est pas disponible pour le moment.<br />
          Veuillez utiliser la liste déroulante ci-dessous.
        </p>
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
