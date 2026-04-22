import Link from 'next/link'
import { ACCENT } from '@/lib/theme'

export default function NotFound() {
  return (
    <section style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px clamp(20px, 5vw, 80px) 80px', textAlign: 'center',
    }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{
          fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800,
          fontSize: 'clamp(80px, 14vw, 140px)', color: ACCENT, lineHeight: 1,
          letterSpacing: '-0.04em', marginBottom: 16,
        }}>404</div>
        <h1 style={{
          fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700,
          fontSize: 'clamp(22px, 3vw, 32px)', color: '#3d3028',
          letterSpacing: '-0.02em', marginBottom: 16,
        }}>Page introuvable</h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, lineHeight: 1.7,
          color: 'rgba(61,48,40,0.6)', marginBottom: 32,
        }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/" style={{
          background: '#3d3028', borderRadius: 10, padding: '14px 32px',
          color: '#f0ebe4', fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
        }}>Retour à l'accueil</Link>
      </div>
    </section>
  )
}
