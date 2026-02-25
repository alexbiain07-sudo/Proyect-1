import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/components/providers/session-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Drive Experience | Grupo Meucci',
  description: 'Descubri tu vehiculo ideal con Grupo Meucci. Elegi entre Scuderia, Dallas y Alliance. Esquiva obstaculos, activa el nitro y competi por el mejor puntaje.',
  openGraph: {
    title: 'Drive Experience | Grupo Meucci',
    description: 'Descubri tu vehiculo ideal con Grupo Meucci. Elegi entre Scuderia, Dallas y Alliance.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
