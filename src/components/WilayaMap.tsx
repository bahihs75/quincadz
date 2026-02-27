'use client'

import React, { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

// Use a reliable GeoJSON source for Algeria's wilayas
const geoUrl = "https://raw.githubusercontent.com/oussamabouchikhi/algeria-geojson/master/wilayas.geojson"

export default function WilayaMap({ onSelect }: { onSelect?: (wilayaId: string) => void }) {
  const [tooltip, setTooltip] = useState('')

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2000, center: [2.5, 28] }} // Algeria coordinates
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
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          {tooltip}
        </div>
      )}
    </div>
  )
}
