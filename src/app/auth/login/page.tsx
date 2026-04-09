'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Lock, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('تم تسجيل الدخول بنجاح')
      router.push('/')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="QuincaDZ" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">QuincaDZ</h1>
          <p className="text-slate-500 text-sm mt-1">تسجيل الدخول إلى حسابك</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg hover:bg-slate-50 transition mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.93c1.665 0 3.156.586 4.341 1.552l3.265-3.265C17.824 1.186 15.117 0 12 0 7.27 0 3.196 2.697 1.207 6.701l4.059 3.064z" />
            <path fill="#34A853" d="M16.04 5.401a7.044 7.044 0 0 1 4.08 2.574l-3.266 3.265c-.92-.648-2.083-1.048-3.388-1.048-2.153 0-3.98 1.384-4.633 3.288l-4.06-3.064C6.12 8.562 8.877 6.3 12.201 6.3c1.316 0 2.558.351 3.639 1.101z" />
            <path fill="#4A90E2" d="M7.047 14.468a7.026 7.026 0 0 1-.351-2.217c0-.762.133-1.498.374-2.186l-4.06-3.064C2.335 9.005 1.8 10.456 1.8 12c0 1.545.536 2.997 1.432 4.179l3.815-2.711z" />
            <path fill="#FBBC05" d="M12.201 17.7c-1.66 0-3.156-.588-4.344-1.552l-3.266 3.265C6.48 21.41 9.176 23 12.201 23c3.026 0 5.72-1.59 7.414-4.065l-3.815-2.711c-1.05 1.645-2.864 2.776-4.999 2.776z" />
          </svg>
          <span>تسجيل الدخول باستخدام Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">أو</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600">تذكرني</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-secondary">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-primary hover:text-secondary font-medium">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  )
}
