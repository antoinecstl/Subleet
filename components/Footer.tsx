'use client'

import Link from 'next/link'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/products' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(61,48,40,0.08)',
      padding: '64px clamp(24px, 5vw, 80px) 40px',
      background: '#e8e0d6',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Image src="/assets/logo.png" alt="" width={28} height={28} style={{ filter: 'brightness(0.2)' }} />
              <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 20, color: '#3d3028' }}>Subleet</span>
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.55)', lineHeight: 1.7, maxWidth: 280 }}>
              Société mère de produits tech innovants. SaaS, IA, et prestations digitales.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(61,48,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Navigation</h4>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'block',
                fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.55)',
                padding: '4px 0', transition: 'color 0.2s', textDecoration: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3d3028')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(61,48,40,0.55)')}
              >{l.label}</Link>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(61,48,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Produits</h4>
            <Link href="https://fi-hub.subleet.com" target="_blank" style={{
              display: 'block',
              fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.55)', padding: '4px 0', textDecoration: 'none',
            }}>fi-hub</Link>
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.3)', fontStyle: 'italic' }}>Plus à venir…</span>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 13, fontWeight: 700, color: 'rgba(61,48,40,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Contact</h4>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.55)', lineHeight: 1.8 }}>
              contact@subleet.com
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(61,48,40,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.35)' }}>© 2026 Subleet. Tous droits réservés.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/mentions-legales" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(61,48,40,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(61,48,40,0.35)')}
            >Mentions légales</Link>
            <Link href="/confidentialite" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(61,48,40,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(61,48,40,0.35)')}
            >Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
