import type { Metadata } from 'next'
import { Bebas_Neue, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'beBirra — Els Lliures de Sabadell',
  description: 'Comptador oficial de birres del grup més lliure de Sabadell.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ca" className={`${bebasNeue.variable} ${sourceSans.variable}`}>
      <body className="bg-[#0D0D0D] text-white font-body antialiased min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar handles both mobile (fixed overlay) and desktop (sticky) internally */}
          <Sidebar />

          {/* Main content — on desktop, sidebar takes 260px, so we add left margin */}
          <main className="flex-1 min-w-0 lg:ml-[260px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
