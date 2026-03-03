import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import ClientGuard from '@/components/ClientGuard'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'QuincaDZ',
  description: 'Hardware marketplace Algeria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body>
        <ClientGuard>
          <LanguageProvider>
            <CartProvider>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
            </CartProvider>
          </LanguageProvider>
        </ClientGuard>
      </body>
    </html>
  )
}
