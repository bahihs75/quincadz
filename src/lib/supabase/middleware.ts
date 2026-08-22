import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Keep public previews and local UI inspection available without a configured backend.
  // Protected operations still require Supabase configuration in the deployment environment.
  if (!supabaseUrl || !supabaseAnonKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role
  }

  const url = request.nextUrl.pathname

  if (!user && (url.startsWith('/client') || url.startsWith('/store') || url.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user) {
    if (url.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
    if (url.startsWith('/store') && role !== 'store') return NextResponse.redirect(new URL('/', request.url))
    if (url.startsWith('/client') && role !== 'client') return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
