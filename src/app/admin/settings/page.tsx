'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'

interface Setting {
  key: string
  value: string
  description: string
}

export default function AdminSettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').order('key')
    setSettings(data || [])
    setLoading(false)
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
  }

  const saveAll = async () => {
    setSaving(true)
    for (const setting of settings) {
      await supabase
        .from('settings')
        .update({ value: setting.value })
        .eq('key', setting.key)
    }
    setSaving(false)
    alert('تم حفظ الإعدادات')
  }

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إعدادات المنصة</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {settings.map(setting => (
            <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="md:w-48 font-medium">{setting.description}</label>
              <input
                type="text"
                value={setting.value}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveAll}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ الكل'}
          </button>
        </div>
      </div>
    </div>
  )
}
