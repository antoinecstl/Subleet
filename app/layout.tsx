import type { Metadata } from 'next'
import { Poppins, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const SITE_URL = 'https://subleet.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Subleet — L\'innovation tech, simplifiée',
    template: '%s — Subleet',
  },
  description: 'Subleet conçoit et opère des produits SaaS et des prestations digitales à forte valeur ajoutée. Technologie, IA et design au service de votre croissance.',
  keywords: ['SaaS', 'IA', 'automatisation', 'site web', 'fi-hub', 'Subleet', 'agence tech'],
  authors: [{ name: 'Subleet' }],
  creator: 'Subleet',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Subleet',
    title: 'Subleet — L\'innovation tech, simplifiée',
    description: 'Produits SaaS, automatisation IA et création de sites — technologie et design au service de votre croissance.',
    images: [{ url: '/assets/logo.png', width: 512, height: 512, alt: 'Subleet' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subleet — L\'innovation tech, simplifiée',
    description: 'Produits SaaS, automatisation IA et création de sites.',
    images: ['/assets/logo.png'],
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${poppins.variable} ${dmSans.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
