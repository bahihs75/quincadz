'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, Lock, LogIn, Eye, EyeOff, Chrome } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Connexion réussie')
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left side – Branding */}
        <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90 p-8 lg:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-md text-center text-white">
            <div className="mb-6 flex justify-center">
              <img src="/logo.png" alt="QuincaDZ" className="h-20 w-auto drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">QuincaDZ</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              La première marketplace algérienne dédiée à la quincaillerie et aux matériaux de construction.
            </p>
            <div className="flex justify-center gap-6 text-sm font-medium opacity-80">
              <span>✓ Produits certifiés</span>
              <span>✓ Livraison rapide</span>
              <span>✓ Paiement sécurisé</span>
            </div>
          </div>
        </div>

        {/* Right side – Form */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Bienvenue</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Connectez-vous à votre compte</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
            >
              <Chrome size={20} className="text-[#4285F4]" />
              <span className="font-medium">Continuer avec Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-400">ou</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="exemple@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline transition">Mot de passe oublié ?</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><LogIn size={18} /> Se connecter</>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Pas encore de compte ?{' '}
              <Link href="/auth/register" className="text-primary font-semibold hover:underline transition">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
