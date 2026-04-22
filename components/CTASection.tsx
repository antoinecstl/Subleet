'use client'

import Link from 'next/link'
import AnimatedSection from './AnimatedSection'
import { ACCENT } from '@/lib/theme'

export default function CTASection() {
  return (
    <section style={{ padding: '80px clamp(20px, 5vw, 80px) 120px' }}>
      <AnimatedSection>
        <div style={{
          maxWidth: 800, margin: '0 auto', textAlign: 'center',
          background: '#2c2218', border: '1px solid rgba(240,235,228,0.06)',
          borderRadius: 24, padding: 'clamp(40px, 6vw, 80px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
            borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          <h2 style={{
            fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800,
            fontSize: 'clamp(24px, 3vw, 40px)', color: '#f0ebe4',
            letterSpacing: '-0.02em', marginBottom: 16, position: 'relative',
          }}>Un projet en tête ?</h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 17, color: 'rgba(240,235,228,0.55)',
            lineHeight: 1.7, marginBottom: 36, position: 'relative',
          }}>
            Que vous cherchiez un partenaire technique ou un produit clé en main, discutons de vos ambitions.
          </p>
          <Link href="/contact" style={{
            background: ACCENT, border: 'none', borderRadius: 10,
            padding: '14px 36px', color: '#fff',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 16, fontWeight: 600,
            boxShadow: `0 4px 32px ${ACCENT}40`,
            transition: 'all 0.3s', position: 'relative', display: 'inline-block',
            textDecoration: 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = '')}
          >Démarrer une conversation →</Link>
        </div>
      </AnimatedSection>
    </section>
  )
}
