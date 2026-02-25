import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('Home page - user:', user)

  if (user) {
    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    console.log('Home page - profile:', profile, 'error:', error)

    if (profile?.role === 'client') {
      console.log('Redirecting to /client')
      redirect('/client')
    }
    if (profile?.role === 'store') {
      console.log('Redirecting to /store')
      redirect('/store')
    }
    if (profile?.role === 'admin') {
      console.log('Redirecting to /admin')
      redirect('/admin')
    }
    console.log('No matching role, staying on home page')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-5xl font-bold mb-4 text-primary">QuincaDZ</h1>
      <p className="text-xl mb-8 text-gray-700">أول سوق إلكتروني لمواد البناء في الجزائر</p>
      <div className="flex gap-4">
        <Link href="/auth/login" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary transition">
          دخول
        </Link>
        <Link href="/auth/register" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
          تسجيل
        </Link>
      </div>
    </main>
  )
}
