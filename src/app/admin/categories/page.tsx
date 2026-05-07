'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

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
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name_ar: formData.name_ar,
      name_fr: formData.name_fr || null,
      icon: formData.icon || null,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    }
    if (editingId) {
      await supabase.from('categories').update(payload).eq('id', editingId)
      toast.success('تم تحديث التصنيف')
    } else {
      await supabase.from('categories').insert(payload)
      toast.success('تم إضافة التصنيف')
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
    toast.success('تم الحذف')
  }

  const moveUp = async (cat: Category) => {
    const prev = categories.filter(c => c.parent_id === cat.parent_id && c.sort_order < cat.sort_order).sort((a,b) => b.sort_order - a.sort_order)[0]
    if (!prev) return
    await supabase.from('categories').update({ sort_order: prev.sort_order }).eq('id', cat.id)
    await supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', prev.id)
    fetchCategories()
  }

  const moveDown = async (cat: Category) => {
    const next = categories.filter(c => c.parent_id === cat.parent_id && c.sort_order > cat.sort_order).sort((a,b) => a.sort_order - b.sort_order)[0]
    if (!next) return
    await supabase.from('categories').update({ sort_order: next.sort_order }).eq('id', cat.id)
    await supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', next.id)
    fetchCategories()
  }

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">إدارة التصنيفات</h1>
        <button onClick={() => { setEditingId(null); setFormData({ name_ar: '', name_fr: '', icon: '', parent_id: '', sort_order: 0, is_active: true }) }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> إضافة تصنيف
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead className="bg-slate-100">
              <tr><th className="px-6 py-3 text-right">الترتيب</th><th className="px-6 py-3 text-right">الأيقونة</th><th className="px-6 py-3 text-right">الاسم (عربي)</th><th className="px-6 py-3 text-right">الاسم (فرنسي)</th><th className="px-6 py-3 text-right">التصنيف الأب</th><th className="px-6 py-3 text-right">الحالة</th><th className="px-6 py-3 text-right">إجراءات</th></tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b">
                  <td className="px-6 py-4"><div className="flex gap-1"><span>{cat.sort_order}</span><button onClick={() => moveUp(cat)}><ChevronUp size={16} /></button><button onClick={() => moveDown(cat)}><ChevronDown size={16} /></button></div></td>
                  <td className="px-6 py-4 text-2xl">{cat.icon || '-'}</td>
                  <td className="px-6 py-4">{cat.name_ar}</td>
                  <td className="px-6 py-4">{cat.name_fr || '-'}</td>
                  <td className="px-6 py-4">{categories.find(c => c.id === cat.parent_id)?.name_ar || '-'}</td>
                  <td className="px-6 py-4"><span className={`badge ${cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{cat.is_active ? 'نشط' : 'غير نشط'}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => editCategory(cat)} className="text-blue-600"><Edit size={18} /></button><button onClick={() => deleteCategory(cat.id)} className="text-red-600"><Trash2 size={18} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for add/edit */}
      {editingId !== null || formData.name_ar !== '' ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'تعديل تصنيف' : 'إضافة تصنيف'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="الاسم (عربي)" className="input" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required />
              <input type="text" placeholder="الاسم (فرنسي)" className="input" value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} />
              <input type="text" placeholder="الأيقونة (emoji)" className="input" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
              <select className="input" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})}>
                <option value="">لا يوجد أب</option>
                {categories.filter(c => !c.parent_id).map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
              <input type="number" placeholder="الترتيب" className="input" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> نشط</label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">{editingId ? 'تحديث' : 'إضافة'}</button>
                <button type="button" onClick={() => { setEditingId(null); setFormData({ name_ar: '', name_fr: '', icon: '', parent_id: '', sort_order: 0, is_active: true }) }} className="btn-secondary">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
