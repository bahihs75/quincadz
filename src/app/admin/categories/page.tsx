'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface Category {
  id: number
  name_ar: string
  name_fr: string | null
  icon: string | null
  parent_id: number | null
  sort_order: number
  is_active: boolean
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name_ar: '',
    name_fr: '',
    icon: '',
    parent_id: '',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    setCategories(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await supabase
        .from('categories')
        .update({
          name_ar: formData.name_ar,
          name_fr: formData.name_fr || null,
          icon: formData.icon || null,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
        })
        .eq('id', editingId)
    } else {
      await supabase.from('categories').insert({
        name_ar: formData.name_ar,
        name_fr: formData.name_fr || null,
        icon: formData.icon || null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      })
    }
    setEditingId(null)
    setFormData({ name_ar: '', name_fr: '', icon: '', parent_id: '', sort_order: 0, is_active: true })
    fetchCategories()
  }

  const editCategory = (cat: Category) => {
    setEditingId(cat.id)
    setFormData({
      name_ar: cat.name_ar,
      name_fr: cat.name_fr || '',
      icon: cat.icon || '',
      parent_id: cat.parent_id?.toString() || '',
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    })
  }

  const deleteCategory = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchCategories()
  }

  const moveUp = async (cat: Category) => {
    const prev = categories
      .filter(c => c.parent_id === cat.parent_id && c.sort_order < cat.sort_order)
      .sort((a, b) => b.sort_order - a.sort_order)[0]
    if (!prev) return
    await supabase
      .from('categories')
      .update({ sort_order: prev.sort_order })
      .eq('id', cat.id)
    await supabase
      .from('categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', prev.id)
    fetchCategories()
  }

  const moveDown = async (cat: Category) => {
    const next = categories
      .filter(c => c.parent_id === cat.parent_id && c.sort_order > cat.sort_order)
      .sort((a, b) => a.sort_order - b.sort_order)[0]
    if (!next) return
    await supabase
      .from('categories')
      .update({ sort_order: next.sort_order })
      .eq('id', cat.id)
    await supabase
      .from('categories')
      .update({ sort_order: cat.sort_order })
      .eq('id', next.id)
    fetchCategories()
  }

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة التصنيفات</h1>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">{editingId ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-gray-700">الاسم (عربي) *</label>
            <input
              type="text"
              required
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">الاسم (فرنسي)</label>
            <input
              type="text"
              value={formData.name_fr}
              onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">الأيقونة</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🔧"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">التصنيف الأب</label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">لا يوجد</option>
              {categories.filter(c => !c.parent_id).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-gray-700">الترتيب</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>نشط</span>
            </label>
          </div>
          <div className="col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? 'تحديث' : 'إضافة'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ name_ar: '', name_fr: '', icon: '', parent_id: '', sort_order: 0, is_active: true })
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right py-3 px-4">الترتيب</th>
              <th className="text-right py-3 px-4">الأيقونة</th>
              <th className="text-right py-3 px-4">الاسم (عربي)</th>
              <th className="text-right py-3 px-4">الاسم (فرنسي)</th>
              <th className="text-right py-3 px-4">التصنيف الأب</th>
              <th className="text-right py-3 px-4">الحالة</th>
              <th className="text-right py-3 px-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <span>{cat.sort_order}</span>
                    <button onClick={() => moveUp(cat)} className="text-gray-500 hover:text-blue-600">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => moveDown(cat)} className="text-gray-500 hover:text-blue-600">
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-2xl">{cat.icon || '-'}</td>
                <td className="py-3 px-4">{cat.name_ar}</td>
                <td className="py-3 px-4">{cat.name_fr || '-'}</td>
                <td className="py-3 px-4">
                  {categories.find(c => c.id === cat.parent_id)?.name_ar || '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cat.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => editCategory(cat)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
