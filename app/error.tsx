'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ACCENT } from '@/lib/theme'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App error]', error)
  }, [error])

  return (
    <section style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px clamp(20px, 5vw, 80px) 80px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{
          fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800,
          fontSize: 'clamp(64px, 10vw, 96px)', color: ACCENT, lineHeight: 1,
          letterSpacing: '-0.04em', marginBottom: 16,
        }}>Oups</div>
        <h1 style={{
          fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700,
          fontSize: 'clamp(22px, 3vw, 32px)', color: '#3d3028',
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>Une erreur est survenue</h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, lineHeight: 1.7,
          color: 'rgba(61,48,40,0.6)', marginBottom: 32,
        }}>
          Nous n'avons pas pu afficher cette page. Réessayez, ou revenez à l'accueil.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} style={{
            background: '#3d3028', border: 'none', borderRadius: 10, padding: '14px 32px',
            color: '#f0ebe4', fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Réessayer</button>
          <Link href="/" style={{
            background: 'transparent', border: '1px solid rgba(61,48,40,0.2)',
            borderRadius: 10, padding: '14px 32px', color: '#3d3028',
            fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, fontWeight: 500,
            textDecoration: 'none', display: 'inline-block',
          }}>Accueil</Link>
        </div>
      </div>
    </section>
  )
}
