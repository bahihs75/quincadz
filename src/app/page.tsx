import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Building2, PackageCheck, ShieldCheck, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'QuincaDZ | مواد البناء والأدوات في الجزائر',
  description: 'سوق جزائري يربط أصحاب المشاريع بمتاجر مواد البناء والأدوات المحلية.',
}

const proofPoints = [
  { icon: PackageCheck, label: 'منتجات محلية واضحة الأسعار' },
  { icon: ShieldCheck, label: 'طلب بالدفع عند الاستلام' },
  { icon: Building2, label: 'تغطية مبنية على الولايات' },
]

export default async function Home() {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )

  if (hasSupabaseConfig) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'client') redirect('/client')
      if (profile?.role === 'store') redirect('/store')
      if (profile?.role === 'admin') redirect('/admin')
    }
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[#f7f6f3]">
      <nav className="container flex items-center justify-between border-b border-[#e4e1dc] py-5">
        <Link href="/" className="flex items-center gap-3" aria-label="QuincaDZ home">
          <Image src="/logo.svg" alt="QuincaDZ" width={36} height={36} priority />
          <span className="text-lg font-extrabold tracking-tight">QuincaDZ</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/auth/login" className="hidden text-[#6f6d68] transition-colors hover:text-[#171717] sm:inline">
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="btn-primary">
            ابدأ الآن <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
      </nav>

      <section className="container grid min-h-[calc(100dvh-81px)] items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
        <div className="order-2 lg:order-1">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#d96b27]">السوق المحلي للأدوات ومواد البناء</p>
          <h1 className="max-w-3xl text-balance text-5xl font-extrabold leading-[1.06] tracking-[-0.05em] text-[#171717] sm:text-6xl lg:text-7xl">
            من ورشتك إلى المنتج المناسب، في خطوة واحدة.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-9 text-[#6f6d68]">
            QuincaDZ يجمع المتاجر الجزائرية والزبائن في مساحة واحدة للعثور على الأدوات، مقارنة الخيارات، وإتمام الطلب محلياً بالدفع عند الاستلام.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register" className="btn-primary px-6 py-3.5">
              اكتشف المنتجات <ArrowLeft size={17} aria-hidden="true" />
            </Link>
            <Link href="/auth/register?role=store" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d9d5ce] bg-white px-6 py-3.5 text-sm font-bold text-[#171717] transition hover:border-[#d96b27]">
              <Store size={17} aria-hidden="true" /> افتح متجرك
            </Link>
          </div>
          <div className="mt-12 grid gap-4 border-t border-[#e4e1dc] pt-6 sm:grid-cols-3">
            {proofPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-2 text-sm leading-6 text-[#6f6d68]">
                <Icon size={17} className="mt-1 shrink-0 text-[#d96b27]" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 relative lg:order-2">
          <div className="absolute -right-12 -top-12 hidden h-40 w-40 border border-[#d96b27]/30 lg:block" aria-hidden="true" />
          <div className="relative overflow-hidden border border-[#d9d5ce] bg-white p-2 shadow-[0_18px_48px_rgba(62,45,31,0.09)]">
            <div className="flex items-center justify-between border-b border-[#e4e1dc] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6f6d68]">
              <span>CATALOG / DZ-01</span>
              <span>2026</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#e4e1dc]">
              <div className="min-h-52 bg-[#efede8] p-5 sm:min-h-64">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f6d68]">01 / hand tools</p>
                <p className="mt-24 text-2xl font-extrabold leading-tight text-[#171717]">معدات<br />الورشة</p>
              </div>
              <div className="min-h-52 bg-[#d96b27] p-5 text-white sm:min-h-64">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/75">02 / delivery</p>
                <p className="mt-24 text-2xl font-extrabold leading-tight">أقرب متجر<br />إليك</p>
              </div>
              <div className="col-span-2 flex min-h-32 items-end justify-between bg-[#171717] p-5 text-white">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">BUILT FOR LOCAL COMMERCE</p>
                  <p className="mt-2 text-xl font-bold">اختيار عملي، من متجر تعرفه.</p>
                </div>
                <PackageCheck size={30} className="text-[#d96b27]" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
