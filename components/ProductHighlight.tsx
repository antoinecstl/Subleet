'use client'

import Link from 'next/link'
import AnimatedSection from './AnimatedSection'

const ACCOUNTS = [
  { label: 'PEA', value: '24 350', delta: '+8,1' },
  { label: 'CTO', value: '18 720', delta: '+14,7' },
  { label: 'AV', value: '42 100', delta: '+11,2' },
]

const FEATURES = [
  { k: 'Vue globale', v: 'Comptes et enveloppes au même endroit' },
  { k: 'Suivi', v: 'Évolution du portefeuille dans le temps' },
  { k: 'Clarté', v: 'Répartition lisible par support' },
]

export default function ProductHighlight() {
  return (
    <section
      style={{
        background: 'var(--noir)',
        color: 'var(--paper)',
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 4vw, 56px)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--ink)',
        borderBottom: '1px solid var(--ink)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.32,
          backgroundImage:
            'radial-gradient(rgba(217,119,6,0.16) 1px, transparent 1px), radial-gradient(rgba(236,223,203,0.04) 1px, transparent 1px)',
          backgroundSize: '4px 4px, 9px 9px',
          backgroundPosition: '0 0, 2px 3px',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      <div style={{ maxWidth: 1440, margin: '0 auto', position: 'relative' }}>
        <AnimatedSection>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 24,
              paddingBottom: 18,
              borderBottom: '1px solid rgba(236,223,203,0.18)',
              marginBottom: 56,
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.22em',
              color: 'rgba(236,223,203,0.55)',
              flexWrap: 'wrap',
            }}
          >
            <span>Produit</span>
            <span style={{ color: 'var(--ember)' }}>fi-hub</span>
          </div>
        </AnimatedSection>

        <div
          className="grid-2"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 'clamp(40px, 5vw, 96px)',
            alignItems: 'center',
          }}
        >
          <AnimatedSection direction="left">
            <div
              className="display"
              style={{
                fontSize: 'clamp(96px, 12vw, 200px)',
                fontWeight: 600,
                lineHeight: 0.82,
                letterSpacing: '-0.045em',
                color: 'var(--paper)',
                marginBottom: 28,
              }}
            >
              fi
              <span style={{ color: 'var(--ember)', fontWeight: 400 }}>·</span>
              <span className="display-italic" style={{ fontWeight: 400 }}>hub</span>
            </div>

            <p
              style={{
                fontSize: 'clamp(17px, 1.5vw, 21px)',
                lineHeight: 1.6,
                color: 'rgba(236,223,203,0.78)',
                maxWidth: 560,
                marginBottom: 36,
              }}
            >
              Une application de suivi patrimonial pensée pour garder une vision
              simple de ses comptes, de son allocation et de l&apos;évolution de son portefeuille.
            </p>

            <ul
              style={{
                listStyle: 'none',
                display: 'grid',
                gap: 14,
                marginBottom: 40,
                maxWidth: 560,
              }}
            >
              {FEATURES.map(f => (
                <li
                  key={f.k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr',
                    gap: 18,
                    paddingBottom: 12,
                    borderBottom: '1px dashed rgba(236,223,203,0.18)',
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      color: 'rgba(236,223,203,0.45)',
                    }}
                  >
                    {f.k}
                  </span>
                  <span style={{ color: 'rgba(236,223,203,0.82)', fontSize: 15 }}>
                    {f.v}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link
                href="/products"
                className="btn-ember"
                style={{ boxShadow: '4px 4px 0 var(--paper)' }}
              >
                Voir la fiche
              </Link>
              <a
                href="https://fi-hub.subleet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{
                  borderColor: 'var(--paper)',
                  color: 'var(--paper)',
                }}
              >
                Ouvrir l&apos;app ↗
              </a>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={120}>
            <div
              style={{
                background: 'var(--noir-soft)',
                border: '1px solid rgba(236,223,203,0.14)',
                padding: 'clamp(20px, 2.5vw, 32px)',
                position: 'relative',
                boxShadow: '14px 14px 0 var(--ember)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 14,
                  borderBottom: '1px solid rgba(236,223,203,0.10)',
                  marginBottom: 22,
                }}
              >
                <div className="mono" style={{ fontSize: 10, color: 'rgba(236,223,203,0.45)', textTransform: 'uppercase', letterSpacing: '0.22em' }}>
                  fi-hub
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(236,223,203,0.2)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(236,223,203,0.2)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)' }} />
                </div>
              </div>

              <div className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(236,223,203,0.45)', marginBottom: 8 }}>
                Portefeuille total
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14,
                  marginBottom: 24,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  className="display"
                  style={{
                    fontSize: 'clamp(48px, 6vw, 80px)',
                    fontWeight: 600,
                    color: 'var(--paper)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  85 170
                </span>
                <span
                  className="display-italic"
                  style={{ fontSize: 32, color: 'var(--ember)', fontWeight: 400 }}
                >
                  €
                </span>
                <span
                  className="mono"
                  style={{
                    marginLeft: 'auto',
                    background: 'rgba(74,222,128,0.14)',
                    color: '#86efac',
                    fontSize: 12,
                    padding: '6px 10px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                  }}
                >
                  +12,4%
                </span>
              </div>

              <div style={{ position: 'relative', marginBottom: 28 }}>
                <svg viewBox="0 0 360 110" style={{ width: '100%', height: 130, overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="phChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
                    </linearGradient>
                    <pattern id="grid" width="60" height="22" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 22" fill="none" stroke="rgba(236,223,203,0.06)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="360" height="110" fill="url(#grid)" />
                  <path
                    d="M0,85 Q30,78 60,72 T120,52 T180,58 T240,32 T300,22 T360,8"
                    fill="none"
                    stroke="var(--ember)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,85 Q30,78 60,72 T120,52 T180,58 T240,32 T300,22 T360,8 L360,110 L0,110 Z"
                    fill="url(#phChart)"
                  />
                  <circle cx="360" cy="8" r="4" fill="var(--ember)" />
                  <circle cx="360" cy="8" r="9" fill="none" stroke="var(--ember)" strokeOpacity="0.4" />
                </svg>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 0,
                  borderTop: '1px solid rgba(236,223,203,0.10)',
                }}
              >
                {ACCOUNTS.map((a, i) => (
                  <div
                    key={a.label}
                    style={{
                      padding: '16px 14px',
                      borderRight: i < ACCOUNTS.length - 1 ? '1px solid rgba(236,223,203,0.10)' : 'none',
                    }}
                  >
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        color: 'rgba(236,223,203,0.4)',
                        marginBottom: 8,
                      }}
                    >
                      {a.label}
                    </div>
                    <div
                      className="display"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'var(--paper)',
                        fontVariantNumeric: 'tabular-nums',
                        marginBottom: 4,
                      }}
                    >
                      {a.value} €
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: '#86efac', letterSpacing: '0.1em' }}>
                      {a.delta}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
