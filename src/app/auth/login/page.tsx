'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Lock, LogIn, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
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

  const handleSendOtp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) {
      toast.error(error.message)
    } else {
      setOtpSent(true)
      toast.success('تم إرسال رمز التحقق إلى هاتفك')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms'
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('تم تسجيل الدخول بنجاح')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">QuincaDZ</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">تسجيل الدخول إلى حسابك</p>
        </div>

        {/* Google Login Button - Only Social */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition mb-6"
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
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">أو</span>
          </div>
        </div>

        {/* Phone OTP Login */}
        {!otpSent ? (
          <div className="mb-6">
            <label className="block mb-1 text-gray-700 dark:text-gray-300 text-sm font-medium">رقم الهاتف</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || !phone}
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
              >
                إرسال الرمز
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block mb-1 text-gray-700 dark:text-gray-300 text-sm font-medium">رمز التحقق</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="أدخل الرمز"
                dir="ltr"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50"
              >
                تحقق
              </button>
            </div>
          </div>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">أو بالبريد الإلكتروني</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300 text-sm font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300 text-sm font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">تذكرني</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  )
}
