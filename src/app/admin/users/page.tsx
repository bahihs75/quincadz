import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserTable from '@/components/admin/UserTable'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة المستخدمين</h1>
      <UserTable users={users || []} />
    </div>
  )
}
