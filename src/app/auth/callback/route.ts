import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              try {
                cookieStore.set({ name, value, ...options })
              } catch (error) {
                // Ignore if called from Server Component
              }
            },
            remove(name: string, options: any) {
              try {
                cookieStore.set({ name, value: '', ...options })
              } catch (error) {
                // Ignore
              }
            },
          },
        }
      )
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Auth exchange error:', error.message)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      // Success – redirect to home (which will then redirect to role-based dashboard)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
