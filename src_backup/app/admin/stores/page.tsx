import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StoreTable from '@/components/admin/StoreTable'

export default async function AdminStoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: stores } = await supabase
    .from('stores')
    .select('*, users(email, full_name), wilayas(name_ar), baladiyas(name_ar)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة المتاجر</h1>
      <StoreTable stores={stores || []} />
    </div>
  )
}
