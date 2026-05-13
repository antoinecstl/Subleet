'use client'

import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        paddingTop: 'clamp(104px, 12vh, 142px)',
        paddingBottom: 'clamp(56px, 7vh, 86px)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -120,
          right: -140,
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, rgba(217,119,6,0.16) 0%, transparent 60%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 56px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 'clamp(36px, 5vw, 72px)',
          alignItems: 'center',
        }}
        className="grid-2"
      >
        <div>
          <h1
            className="display rise hero-headline"
            style={{
              fontSize: 'clamp(64px, 10vw, 148px)',
              fontWeight: 500,
              color: 'var(--ink)',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
            }}
          >
            Software,<br />
            IA appliquée,<br />
            <span className="display-italic" style={{ color: 'var(--ember-hot)', fontWeight: 400 }}>
              systèmes utiles.
            </span>
          </h1>

          <div
            className="rise"
            style={{
              marginTop: 34,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 32,
              alignItems: 'end',
              animationDelay: '0.15s',
            }}
          >
            <p
              style={{
                maxWidth: 620,
                fontFamily: 'var(--font-body), sans-serif',
                fontSize: 'clamp(16px, 1.5vw, 19px)',
                lineHeight: 1.7,
                color: 'var(--ink-soft)',
              }}
            >
              Subleet conçoit des produits logiciels, des systèmes IA et des
              interfaces métier pour transformer une idée ambitieuse en outil
              fiable. <Link href="/products" className="italic-shift" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ember)' }}>fi-hub</Link>{' '}
              est notre premier produit public.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
              <Link href="/products" className="btn-ember">
                Voir les produits
              </Link>
              <Link href="/contact" className="btn-ghost" style={{ boxShadow: 'none' }}>
                Nous écrire
              </Link>
            </div>
          </div>
        </div>

        <aside
          className="rise hero-aside"
          style={{
            position: 'relative',
            paddingLeft: 28,
            borderLeft: '1px solid var(--ink-faint)',
            animationDelay: '0.25s',
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--ember-hot)',
              marginBottom: 18,
            }}
          >
            Produit en ligne
          </div>

          <h3
            className="display"
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--ink)',
              lineHeight: 1.05,
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}
          >
            <span className="display-italic">fi-hub</span>
            <br />
            Suivi patrimonial simplifié.
          </h3>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'var(--ink-soft)',
              marginBottom: 28,
            }}
          >
            Un tableau de bord personnel pour suivre vos comptes, vos mouvements
            et votre allocation au même endroit.
          </p>

          <div
            style={{
              background: 'var(--noir)',
              color: 'var(--paper)',
              padding: '18px 20px',
              borderRadius: 0,
              border: '1px solid var(--ink)',
              boxShadow: '6px 6px 0 var(--ember)',
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: 'rgba(236,223,203,0.4)',
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Vue fi-hub</span>
              <span style={{ color: '#4ade80' }}>Démo</span>
            </div>

            <div
              className="display"
              style={{
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--paper)',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: 14,
              }}
            >
              85 170 <span style={{ fontStyle: 'italic', color: 'var(--ember)', fontWeight: 400 }}>€</span>
            </div>

            <svg viewBox="0 0 240 50" style={{ width: '100%', height: 42, overflow: 'visible' }}>
              <defs>
                <linearGradient id="heroChart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,38 Q20,34 40,30 T80,22 T120,26 T160,16 T200,14 T240,4"
                fill="none"
                stroke="var(--ember)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M0,38 Q20,34 40,30 T80,22 T120,26 T160,16 T200,14 T240,4 L240,50 L0,50 Z"
                fill="url(#heroChart)"
              />
            </svg>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              href="/products"
              className="draw-link mono"
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--ember-hot)',
                fontWeight: 600,
              }}
            >
              Voir le produit →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
