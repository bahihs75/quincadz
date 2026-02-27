'use client'

import React from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const geoUrl = "https://gist.githubusercontent.com/mohammed-elhaouari/1b8f5a6f6b5b5b5b5b5b/raw/algeria-wilayas.json"

export default function WilayaMap({ onSelect }: { onSelect?: (wilayaId: string) => void }) {
  return (
    <ComposableMap>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              onClick={() => onSelect?.(geo.id)}
              style={{
                default: { fill: "#D6D6DA", outline: "none" },
                hover: { fill: "#F53", outline: "none" },
                pressed: { fill: "#E42", outline: "none" },
              }}
            />
          ))
        }
      </Geographies>
    </ComposableMap>
  )
}
