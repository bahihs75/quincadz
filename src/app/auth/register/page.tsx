'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Lock, LogIn, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import GoogleMark from '@/components/icons/GoogleMark'
import { getAuthErrorMessage } from '@/lib/authError'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = isSupabaseConfigured ? createClient() : null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      toast.error('خدمة التسجيل غير مهيأة بعد. أضف إعدادات Supabase في بيئة النشر.')
      return
    }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      toast.error('البريد الإلكتروني وتأكيده غير متطابقين.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('كلمة المرور وتأكيدها غير متطابقين.')
      return
    }
    if (password.length < 6) {
      toast.error('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim(), role: 'client' } },
      })
      if (error) throw error
      toast.success('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده.')
      router.push('/auth/login?message=confirm-email')
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'تعذر إنشاء الحساب. حاول مرة أخرى.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabase) {
      toast.error('خدمة التسجيل غير مهيأة بعد. أضف إعدادات Supabase في بيئة النشر.')
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
      toast.error(getAuthErrorMessage(error, 'تعذر بدء التسجيل عبر Google.'))
      setLoading(false)
    }
  }

  return (
    <main dir="rtl" className="min-h-[100dvh] bg-[#F5F2EA] px-4 py-10 text-[#111111] sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-3" aria-label="العودة إلى الصفحة الرئيسية">
          <img src="/logo.svg" alt="QuincaDZ" className="h-11 w-auto" />
          <span className="text-xl font-extrabold tracking-tight">QuincaDZ</span>
        </Link>

        <section className="w-full border border-[#D8D4CB] bg-[#FFFFFF] p-6 shadow-[0_18px_48px_rgba(17,17,17,0.09)] sm:p-8">
          <div className="mb-8 text-center">
            {!isSupabaseConfigured && <div role="alert" className="mb-5 border border-[#C62828]/30 bg-[#C62828]/10 px-3 py-2 text-right text-xs leading-5 text-[#C62828]">التسجيل غير مهيأ في هذه البيئة. يمكنك عرض الواجهة، لكن إنشاء الحساب يحتاج إعداد Supabase.</div>}
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#777777]">ACCOUNT / CREATE</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">أنشئ حسابك</h1>
            <p className="mt-2 text-sm text-[#777777]">ابدأ التسوق من متاجر الأدوات والمواد القريبة منك.</p>
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading || !isSupabaseConfigured} className="flex min-h-12 w-full items-center justify-center gap-3 border border-[#D8D4CB] bg-[#FFFFFF] px-4 py-3 text-sm font-bold text-[#111111] transition hover:border-[#F5C400] hover:bg-[#F5F2EA] disabled:cursor-not-allowed disabled:opacity-50">
            <GoogleMark size={20} />
            <span>المتابعة باستخدام Google</span>
          </button>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#D8D4CB]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#FFFFFF] px-3 text-[#777777]">أو بالبريد الإلكتروني</span></div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <AuthField id="register-name" label="الاسم الكامل" icon={<User size={18} aria-hidden="true" />}>
              <input id="register-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} className="input w-full pr-10" placeholder="الاسم واللقب" autoComplete="name" required />
            </AuthField>
            <AuthField id="register-email" label="البريد الإلكتروني" icon={<Mail size={18} aria-hidden="true" />}>
              <input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input w-full pr-10" placeholder="you@example.com" autoComplete="email" required />
            </AuthField>
            <AuthField id="register-confirm-email" label="تأكيد البريد الإلكتروني" icon={<Mail size={18} aria-hidden="true" />}>
              <input id="register-confirm-email" type="email" value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} className="input w-full pr-10" placeholder="you@example.com" autoComplete="email" required />
            </AuthField>
            <AuthField id="register-password" label="كلمة المرور" icon={<Lock size={18} aria-hidden="true" />}>
              <input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input w-full pr-10" placeholder="••••••••" autoComplete="new-password" minLength={6} required />
            </AuthField>
            <AuthField id="register-confirm-password" label="تأكيد كلمة المرور" icon={<Lock size={18} aria-hidden="true" />}>
              <input id="register-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input w-full pr-10" placeholder="••••••••" autoComplete="new-password" minLength={6} required />
            </AuthField>

            <button type="submit" disabled={loading || !isSupabaseConfigured} className="btn-primary mt-1 min-h-12 w-full">
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" aria-label="جارٍ إنشاء الحساب" /> : <><LogIn size={18} aria-hidden="true" /> إنشاء الحساب <ArrowLeft size={17} aria-hidden="true" /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#777777]">لديك حساب بالفعل؟ <Link href="/auth/login" className="font-bold text-[#111111] underline decoration-[#F5C400] decoration-2 underline-offset-4">سجّل الدخول</Link></p>
        </section>
      </div>
    </main>
  )
}

function AuthField({ id, label, icon, children }: { id: string; label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="grid gap-2"><label htmlFor={id} className="text-sm font-bold">{label}</label><div className="relative"><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777]">{icon}</span>{children}</div></div>
}
