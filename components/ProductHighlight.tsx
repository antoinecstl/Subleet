'use client'

import Link from 'next/link'
import AnimatedSection from './AnimatedSection'

const ACCENT = '#f59e0b'

export default function ProductHighlight() {
  return (
    <section style={{
      padding: '120px clamp(20px, 5vw, 80px)',
      background: 'linear-gradient(180deg, rgba(61,48,40,0.04) 0%, transparent 100%)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      }} className="hero-grid">

        <AnimatedSection direction="left">
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Produit phare</span>
          <h2 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#3d3028', letterSpacing: '-0.02em', marginTop: 12, marginBottom: 20 }}>fi-hub</h2>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 17, color: 'rgba(61,48,40,0.6)', lineHeight: 1.8, marginBottom: 32 }}>
            La plateforme qui centralise PEA, comptes-titres, livrets et assurances-vie dans un tableau de bord unique, avec une valorisation en temps réel de votre patrimoine.
          </p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 36 }}>
            {[{ num: '5+', label: 'Types de comptes' }, { num: '∞', label: 'Actifs suivis' }, { num: '<1s', label: 'Temps réel' }].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 28, color: ACCENT }}>{s.num}</div>
                <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.45)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <Link href="/products" style={{
            background: 'transparent', border: `1px solid ${ACCENT}50`,
            borderRadius: 10, padding: '12px 28px', color: ACCENT,
            fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, fontWeight: 600,
            textDecoration: 'none', transition: 'all 0.3s', display: 'inline-block',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = ACCENT + '12')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >En savoir plus →</Link>
        </AnimatedSection>

        <AnimatedSection direction="right" delay={120}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%', maxWidth: 420, aspectRatio: '4/3',
              background: '#2c2218', borderRadius: 20,
              border: '1px solid rgba(61,48,40,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 32px 80px rgba(61,48,40,0.12)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(240,235,228,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,235,228,0.3) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, margin: '0 auto 16px',
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}77)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 32px ${ACCENT}40`,
                }}>
                  <span style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 32, color: '#fff' }}>f</span>
                </div>
                <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 18, color: '#f0ebe4' }}>fi-hub</div>
                <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(240,235,228,0.45)', marginTop: 4 }}>Wealth Tracking Platform</div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
