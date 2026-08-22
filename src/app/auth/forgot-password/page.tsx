'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white  rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary ">QuincaDZ</h1>
          <p className="text-slate-600  mt-2">إعادة تعيين كلمة المرور</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <p className="text-slate-600  mb-6 text-sm">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
            <div className="mb-6">
              <label className="block mb-1 text-slate-700  text-sm font-medium">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white  text-slate-900 "
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال الرابط'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#234F32]/10 text-[#234F32] shadow-[0_8px_20px_rgba(35,79,50,0.12)]">
              <CheckCircle2 size={32} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <p className="text-slate-600  mb-6">
              تم إرسال الرابط إلى <strong>{email}</strong>. يرجى التحقق من بريدك الإلكتروني.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-primary  hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} />
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}
