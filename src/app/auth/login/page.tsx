'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAuthErrorMessage } from '@/lib/authError'
import GoogleMark from '@/components/icons/GoogleMark'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = isSupabaseConfigured ? createClient() : null

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
      return
    }

    if (!supabase) {
      toast.error('خدمة تسجيل الدخول غير مهيأة بعد. أضف إعدادات Supabase في بيئة النشر.')
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
    if (!supabase) {
      toast.error('خدمة تسجيل الدخول غير مهيأة بعد. أضف إعدادات Supabase في بيئة النشر.')
      return
    }

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
            {!isSupabaseConfigured && <div role="alert" className="mb-5 border border-[#C62828]/30 bg-[#C62828]/10 px-3 py-2 text-right text-xs leading-5 text-[#C62828]">المصادقة غير مهيأة في هذه البيئة. يمكنك عرض الواجهة، لكن تسجيل الدخول يحتاج إعداد Supabase.</div>}
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777777]">ACCOUNT / ACCESS</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">مرحباً بعودتك</h1>
            <p className="mt-2 text-sm text-[#777777]">سجّل الدخول للوصول إلى طلباتك ومتاجرك المفضلة.</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || !isSupabaseConfigured}
            className="flex min-h-12 w-full items-center justify-center gap-3 border border-[#D8D4CB] bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#111111] transition hover:border-[#F5C400] hover:bg-[#F5F2EA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleMark size={20} />
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

            <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn-primary mt-1 min-h-12 w-full">
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
