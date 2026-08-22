'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAuthErrorMessage } from '@/lib/authError'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error

      toast.success('تم تسجيل الدخول بنجاح.')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
      })
      if (error) throw error
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'تعذر بدء تسجيل الدخول عبر Google.'))
      setLoading(false)
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#F5F2EA] px-4 py-10 text-[#111111] sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-3" aria-label="العودة إلى الصفحة الرئيسية">
          <img src="/logo.svg" alt="QuincaDZ" className="h-11 w-auto" />
          <span className="text-xl font-extrabold tracking-tight">QuincaDZ</span>
        </Link>

        <section className="w-full border border-[#D8D4CB] bg-[#FFFFFF] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.09)] sm:p-8">
          <div className="mb-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777777]">ACCOUNT / ACCESS</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">مرحباً بعودتك</h1>
            <p className="mt-2 text-sm text-[#777777]">سجّل الدخول للوصول إلى طلباتك ومتاجرك المفضلة.</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-3 border border-[#D8D4CB] bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#111111] transition hover:border-[#F5C400] hover:bg-[#F5F2EA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.93c1.665 0 3.156.586 4.341 1.552l3.265-3.265C17.824 1.186 15.117 0 12 0 7.27 0 3.196 2.697 1.207 6.701l4.059 3.064z" />
              <path fill="#34A853" d="M16.04 5.401a7.044 7.044 0 0 1 4.08 2.574l-3.266 3.265c-.92-.648-2.083-1.048-3.388-1.048-2.153 0-3.98 1.384-4.633 3.288l-4.06-3.064C6.12 8.562 8.877 6.3 12.201 6.3c1.316 0 2.558.351 3.639 1.101z" />
              <path fill="#4A90E2" d="M7.047 14.468a7.026 7.026 0 0 1-.351-2.217c0-.762.133-1.498.374-2.186l-4.06-3.064C2.335 9.005 1.8 10.456 1.8 12c0 1.545.536 2.997 1.432 4.179l3.815-2.711z" />
              <path fill="#FBBC05" d="M12.201 17.7c-1.66 0-3.156-.588-4.344-1.552l-3.266 3.265C6.48 21.41 9.176 23 12.201 23c3.026 0 5.72-1.59 7.414-4.065l-3.815-2.711c-1.05 1.645-2.864 2.776-4.999 2.776z" />
            </svg>
            <span>المتابعة باستخدام Google</span>
          </button>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#D8D4CB]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#FFFFFF] px-3 text-[#777777]">أو بالبريد الإلكتروني</span></div>
          </div>

          <form onSubmit={handleEmailLogin} className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="login-email" className="text-sm font-bold">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777]" size={18} aria-hidden="true" />
                <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input w-full pr-10" placeholder="you@example.com" autoComplete="email" required />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-sm font-bold">كلمة المرور</label>
                <Link href="/auth/forgot-password" className="text-xs font-bold text-[#777777] transition hover:text-[#111111]">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777]" size={18} aria-hidden="true" />
                <input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input w-full pr-10" placeholder="••••••••" autoComplete="current-password" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-1 min-h-12 w-full">
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" aria-label="جارٍ تسجيل الدخول" /> : <><LogIn size={18} aria-hidden="true" /> تسجيل الدخول <ArrowLeft size={17} aria-hidden="true" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#777777]">
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" className="font-bold text-[#111111] underline decoration-[#F5C400] decoration-2 underline-offset-4">أنشئ حساباً</Link>
          </p>
        </section>
      </div>
    </main>
  )
}
