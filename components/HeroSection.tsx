'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ACCENT } from '@/lib/theme'

export default function HeroSection() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '120px clamp(20px, 5vw, 80px) 80px',
    }}>
      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600,
        background: `radial-gradient(circle, ${ACCENT}12 0%, transparent 70%)`,
        borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-15%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(61,48,40,0.06) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(61,48,40,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(61,48,40,0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      }} className="hero-grid">

        {/* Left — text */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`,
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 500, color: '#8a6d3b' }}>
              L'innovation tech, simplifiée
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800,
            fontSize: 'clamp(34px, 5vw, 64px)', lineHeight: 1.08,
            color: '#3d3028', letterSpacing: '-0.03em', marginBottom: 24,
          }}>
            Nous construisons les
            <span style={{ color: ACCENT, display: 'block' }}>outils de demain</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 'clamp(16px, 1.8vw, 18px)', lineHeight: 1.7,
            color: 'rgba(61,48,40,0.6)', maxWidth: 460, marginBottom: 40,
          }}>
            Subleet conçoit et opère des produits SaaS et des prestations digitales à forte valeur ajoutée — technologie, IA et design au service de votre croissance.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/products" style={{
              background: '#3d3028', borderRadius: 10,
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

        {/* Right — fi-hub mockup */}
        <div className="hero-card-outer" style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.22,1,0.36,1) 0.2s',
        }}>
          <div style={{
            background: '#2c2218', border: '1px solid rgba(61,48,40,0.15)',
            borderRadius: 20, padding: 28, position: 'relative',
            boxShadow: '0 24px 80px rgba(61,48,40,0.15)',
          }}>
            {/* Card header — logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-poppins), sans-serif' }}>f</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 15, color: '#f0ebe4' }}>fi-hub</div>
                <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'rgba(240,235,228,0.4)' }}>Wealth Tracking</div>
              </div>
            </div>

            {/* Chart — overflow:visible so the stroke tip isn't clipped */}
            <svg
              viewBox="0 -6 300 76"
              style={{ width: '100%', height: 70, marginBottom: 16, overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Path stays inside the original coords; viewBox extended upward by 6 */}
              <path d="M0,55 Q30,48 60,42 T120,28 T180,32 T240,14 T300,4"
                fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
              <path d="M0,55 Q30,48 60,42 T120,28 T180,32 T240,14 T300,4 L300,70 L0,70Z"
                fill="url(#chartGrad)" />
            </svg>

            {/* Account tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'PEA', val: '24 350 €' },
                { label: 'CTO', val: '18 720 €' },
                { label: 'AV', val: '42 100 €' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(240,235,228,0.05)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 10, color: 'rgba(240,235,228,0.4)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 14, fontWeight: 700, color: '#f0ebe4' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Floating total badge — top-right */}
            <div className="hero-float-badge" style={{
              position: 'absolute', top: -16, right: -16, background: '#3a2e22',
              border: '1px solid rgba(240,235,228,0.08)', borderRadius: 12, padding: '10px 16px',
              boxShadow: '0 8px 32px rgba(61,48,40,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'rgba(240,235,228,0.4)' }}>Portefeuille total</div>
              </div>
              <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 20, fontWeight: 800, color: '#f0ebe4' }}>85 170 €</div>
              <span style={{
                  background: 'rgba(74,222,128,0.15)', color: '#4ade80',
                  fontSize: 14, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
                  fontFamily: 'var(--font-dm-sans), sans-serif', letterSpacing: '0.03em',
                  display: 'block', width: 'fit-content', margin: '1px auto 0',
                }}>+12,4 %</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
