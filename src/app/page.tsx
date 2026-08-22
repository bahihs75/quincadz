import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Building2, PackageCheck, ShieldCheck, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PILOT_WILAYAS } from '@/lib/launch'

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
    <main className="min-h-[100dvh] overflow-hidden bg-[#F5F2EA]">
      <nav className="container flex items-center justify-between border-b border-[#D8D4CB] py-5">
        <Link href="/" className="flex items-center gap-3" aria-label="QuincaDZ home">
          <Image src="/logo.svg" alt="QuincaDZ" width={36} height={36} priority />
          <span className="text-lg font-extrabold tracking-tight">QuincaDZ</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/auth/login" className="hidden text-[#777777] transition-colors hover:text-[#111111] sm:inline">
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="btn-primary">
            ابدأ الآن <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
      </nav>

      <section className="container grid min-h-[calc(100dvh-81px)] items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
        <div className="order-2 lg:order-1">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#F5C400]">السوق المحلي للأدوات ومواد البناء</p>
          <h1 className="max-w-3xl text-balance text-5xl font-extrabold leading-[1.06] tracking-[-0.05em] text-[#111111] sm:text-6xl lg:text-7xl">
            من ورشتك إلى المنتج المناسب، في خطوة واحدة.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-9 text-[#777777]">
            QuincaDZ يجمع المتاجر الجزائرية والزبائن في مساحة واحدة للعثور على الأدوات، مقارنة الخيارات، وإتمام الطلب محلياً بالدفع عند الاستلام.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register" className="btn-primary px-6 py-3.5">
              اكتشف المنتجات <ArrowLeft size={17} aria-hidden="true" />
            </Link>
            <Link href="/auth/register?role=store" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#D8D4CB] bg-white px-6 py-3.5 text-sm font-bold text-[#111111] transition hover:border-[#F5C400]">
              <Store size={17} aria-hidden="true" /> افتح متجرك
            </Link>
          </div>
          <div className="mt-12 grid gap-4 border-t border-[#D8D4CB] pt-6 sm:grid-cols-3">
            {proofPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-start gap-2 text-sm leading-6 text-[#777777]">
                <Icon size={17} className="mt-1 shrink-0 text-[#F5C400]" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs font-semibold text-[#777777]">
            المرحلة التجريبية: {PILOT_WILAYAS.map((wilaya) => wilaya.nameAr).join('، ')}
          </p>
        </div>

        <div className="order-1 relative lg:order-2">
          <div className="absolute -right-12 -top-12 hidden h-40 w-40 border border-[#F5C400]/30 lg:block" aria-hidden="true" />
          <div className="relative overflow-hidden border border-[#D8D4CB] bg-white p-2 shadow-[0_18px_48px_rgba(17,17,17,0.09)]">
            <div className="flex items-center justify-between border-b border-[#D8D4CB] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#777777]">
              <span>CATALOG / DZ-01</span>
              <span>2026</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#D8D4CB]">
              <div className="min-h-52 bg-[#F5F2EA] p-5 sm:min-h-64">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#777777]">01 / hand tools</p>
                <p className="mt-24 text-2xl font-extrabold leading-tight text-[#111111]">معدات<br />الورشة</p>
              </div>
              <div className="min-h-52 bg-[#F5C400] p-5 text-[#111111] sm:min-h-64">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#111111]/60">02 / delivery</p>
                <p className="mt-24 text-2xl font-extrabold leading-tight">أقرب متجر<br />إليك</p>
              </div>
              <div className="col-span-2 flex min-h-32 items-end justify-between bg-[#111111] p-5 text-white">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">BUILT FOR LOCAL COMMERCE</p>
                  <p className="mt-2 text-xl font-bold">اختيار عملي، من متجر تعرفه.</p>
                </div>
                <PackageCheck size={30} className="text-[#F5C400]" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
