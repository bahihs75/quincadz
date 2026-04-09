'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { User, Mail, Phone, LogOut, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { t, language, setLanguage } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setFormData({
        full_name: data?.full_name || '',
        phone: data?.phone || '',
      })
      setLoading(false)
    }
    fetchUser()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success(t('logout_success'))
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
      toast.success(t('profile_updated'))
    } else {
      toast.error(t('error_occurred') + ': ' + error.message)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">{t('loading')}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-black ">{t('profile')}</h1>

      <div className="gradient-card w-full max-w-2xl p-6">
        <div className="z-10 relative">
          {/* Header with avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profile?.full_name || t('user')}</h2>
              <p className="text-white/80">{profile?.email}</p>
            </div>
          </div>

          {/* Member since */}
          <div className="mb-6 p-3 bg-white/10 rounded-lg">
            <p className="text-white text-sm">
              {t('member_since')} {new Date(profile?.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Language selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Globe size={20} />
              {t('language')}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setLanguage('ar')}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  language === 'ar'
                    ? 'bg-white text-primary border-white'
                    : 'bg-transparent text-white border-white/30 hover:bg-white/20'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  language === 'fr'
                    ? 'bg-white text-primary border-white'
                    : 'bg-transparent text-white border-white/30 hover:bg-white/20'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  language === 'en'
                    ? 'bg-white text-primary border-white'
                    : 'bg-transparent text-white border-white/30 hover:bg-white/20'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Edit profile form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-white/90 text-sm font-medium">{t('full_name')}</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div>
              <label className="block mb-1 text-white/90 text-sm font-medium">{t('email')}</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white/70 cursor-not-allowed"
              />
              <p className="text-xs text-white/50 mt-1">{t('email_cannot_change')}</p>
            </div>
            <div>
              <label className="block mb-1 text-white/90 text-sm font-medium">{t('phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-white text-primary font-bold py-3 px-4 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
              >
                {saving ? t('saving') : t('save_changes')}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                {t('logout')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
