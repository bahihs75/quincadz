'use client'

import { useState } from 'react'
import { wilayas, baladiyas } from '@/lib/algeriaData'

interface Props {
  onSelect: (wilayaId: number, baladiyaId: number) => void
  initialWilayaId?: number
  initialBaladiyaId?: number
}

export default function LocationSelector({ onSelect, initialWilayaId, initialBaladiyaId }: Props) {
  const [selectedWilaya, setSelectedWilaya] = useState<number | ''>(initialWilayaId || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredBaladiyas = baladiyas
    .filter(b => b.wilaya_id === selectedWilaya)
    .filter(b => b.name_ar.includes(searchTerm) || b.name_fr.includes(searchTerm))

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-gray-700">الولاية</label>
        <select
          value={selectedWilaya}
          onChange={(e) => {
            setSelectedWilaya(Number(e.target.value) || '')
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
                    onSelect(Number(selectedWilaya), b.id)
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
  )
}
