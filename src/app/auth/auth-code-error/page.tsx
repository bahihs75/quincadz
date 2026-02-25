'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-600">خطأ في المصادقة</h1>
      <p className="mb-4">عذراً، حدث خطأ أثناء محاولة تسجيل الدخول.</p>
      {error && (
        <p className="mb-4 text-sm text-gray-600 bg-gray-100 p-2 rounded">
          {error}
        </p>
      )}
      <Link href="/auth/login" className="text-blue-600 underline">
        العودة إلى تسجيل الدخول
      </Link>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">جاري التحميل...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
