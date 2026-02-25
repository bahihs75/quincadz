'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Shield, User, Store } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: 'client' | 'store' | 'admin'
  created_at: string
}

export default function UserTable({ users }: { users: User[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [processing, setProcessing] = useState<string | null>(null)

  const changeRole = async (userId: string, newRole: 'client' | 'store' | 'admin') => {
    setProcessing(userId)
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    setProcessing(null)
    router.refresh()
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    setProcessing(userId)
    await supabase.from('users').delete().eq('id', userId)
    setProcessing(null)
    router.refresh()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={16} className="text-red-500" />
      case 'store': return <Store size={16} className="text-blue-500" />
      default: return <User size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right py-3 px-4">الاسم</th>
              <th className="text-right py-3 px-4">البريد الإلكتروني</th>
              <th className="text-right py-3 px-4">رقم الهاتف</th>
              <th className="text-right py-3 px-4">الدور</th>
              <th className="text-right py-3 px-4">تاريخ التسجيل</th>
              <th className="text-right py-3 px-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.full_name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.phone || '-'}</td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value as any)}
                    disabled={processing === user.id}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="client">عميل</option>
                    <option value="store">متجر</option>
                    <option value="admin">مدير</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  {new Date(user.created_at).toLocaleDateString('ar-EG')}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={processing === user.id}
                    className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
