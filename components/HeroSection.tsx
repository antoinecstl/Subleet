'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const ACCENT = '#f59e0b'

export default function HeroSection() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '120px clamp(24px, 5vw, 80px) 80px',
    }}>
      {/* Gradient orb top-right */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: 700, height: 700,
        background: `radial-gradient(circle, ${ACCENT}12 0%, transparent 70%)`,
        borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
      }} />
      {/* Gradient orb bottom-left */}
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-15%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(61,48,40,0.06) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(61,48,40,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(61,48,40,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      }} className="hero-grid">
        {/* Left: text */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`,
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 500, color: '#8a6d3b' }}>
              L&apos;innovation tech, simplifiée
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.08,
            color: '#3d3028', letterSpacing: '-0.03em', marginBottom: 24,
          }}>
            Nous construisons les
            <span style={{ color: ACCENT, display: 'block' }}>outils de demain</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 18, lineHeight: 1.7,
            color: 'rgba(61,48,40,0.6)', maxWidth: 460, marginBottom: 40,
          }}>
            Subleet conçoit et opère des produits SaaS et des prestations digitales à forte valeur ajoutée. Technologie, IA et design au service de votre croissance.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/products" style={{
              background: '#3d3028', border: 'none', borderRadius: 10,
              padding: '14px 32px', color: '#f0ebe4',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(61,48,40,0.2)',
              transition: 'all 0.3s', display: 'inline-block',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
            >Découvrir nos produits</Link>

            <Link href="/contact" style={{
              background: 'transparent', border: '1px solid rgba(61,48,40,0.2)',
              borderRadius: 10, padding: '14px 32px', color: '#3d3028',
              fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.3s', display: 'inline-block',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(61,48,40,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(61,48,40,0.2)')}
            >Nous contacter</Link>
          </div>
        </div>

        {/* Right: fi-hub card mockup */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.22,1,0.36,1) 0.2s',
        }}>
          <div style={{
            background: '#2c2218', border: '1px solid rgba(61,48,40,0.15)',
            borderRadius: 20, padding: 32, position: 'relative',
            boxShadow: '0 24px 80px rgba(61,48,40,0.15), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-poppins), sans-serif' }}>f</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 16, color: '#f0ebe4' }}>fi-hub</div>
                <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'rgba(240,235,228,0.4)' }}>Wealth Tracking</div>
              </div>
              <span style={{ marginLeft: 'auto', background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, fontFamily: 'var(--font-dm-sans), sans-serif', marginTop: '8px' }}>+12.4%</span>
            </div>

            <svg viewBox="0 0 300 80" style={{ width: '100%', height: 80, marginBottom: 20 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,60 Q30,55 60,50 T120,35 T180,40 T240,20 T300,10" fill="none" stroke={ACCENT} strokeWidth="2" />
              <path d="M0,60 Q30,55 60,50 T120,35 T180,40 T240,20 T300,10 L300,80 L0,80Z" fill="url(#chartGrad)" />
            </svg>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[{ label: 'PEA', val: '€24,350' }, { label: 'CTO', val: '€18,720' }, { label: 'AV', val: '€42,100' }].map(s => (
                <div key={s.label} style={{ background: 'rgba(240,235,228,0.05)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'rgba(240,235,228,0.4)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 16, fontWeight: 700, color: '#f0ebe4' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Floating total badge */}
            <div style={{
              position: 'absolute', top: -16, right: -16, background: '#3a2e22',
              border: '1px solid rgba(240,235,228,0.08)', borderRadius: 12, padding: '10px 16px',
              boxShadow: '0 8px 32px rgba(61,48,40,0.25)',
            }}>
              <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'rgba(240,235,228,0.4)' }}>Portefeuille total</div>
              <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 20, fontWeight: 800, color: '#f0ebe4' }}>€85,170</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
