import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Produits',
  description: 'Découvrez les produits Subleet, dont fi-hub, notre application de suivi patrimonial.',
}

const FEATURES = [
  {
    title: 'Vue consolidée',
    text: 'Regrouper les principales enveloppes financières dans une interface unique et lisible.',
  },
  {
    title: 'Suivi dans le temps',
    text: 'Comprendre l’évolution d’un portefeuille sans multiplier les fichiers et les interfaces.',
  },
  {
    title: 'Lecture claire',
    text: 'Mettre en avant les informations utiles plutôt que d’empiler des métriques secondaires.',
  },
]

const ACCOUNTS = [
  { label: 'PEA', value: '24 350 €', tone: 'var(--ember)' },
  { label: 'CTO', value: '18 720 €', tone: '#5c9cfc' },
  { label: 'AV', value: '42 100 €', tone: '#4ade80' },
]

export default function ProductsPage() {
  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: 'clamp(88px, 13vh, 150px) clamp(20px, 4vw, 56px) 56px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="eyebrow eyebrow-ember" style={{ marginBottom: 18 }}>
            Produits
          </div>
          <h1
            className="display"
            style={{
              fontSize: 'clamp(64px, 10vw, 148px)',
              fontWeight: 500,
              color: 'var(--ink)',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              maxWidth: 980,
            }}
          >
            Des outils sobres pour des usages concrets.
          </h1>
          <p
            style={{
              marginTop: 32,
              maxWidth: 680,
              fontSize: 'clamp(17px, 1.6vw, 21px)',
              lineHeight: 1.7,
              color: 'var(--ink-soft)',
            }}
          >
            Subleet développe des produits digitaux avec une attention particulière
            portée à la clarté, à la stabilité et à l’expérience utilisateur.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 clamp(20px, 4vw, 56px) clamp(88px, 12vh, 150px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div
            className="grid-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              border: '1px solid var(--ink)',
              background: 'var(--paper-warm)',
              boxShadow: '14px 14px 0 var(--ember)',
            }}
          >
            <div style={{ padding: 'clamp(32px, 5vw, 72px)' }}>
              <div className="eyebrow eyebrow-ember" style={{ marginBottom: 18 }}>
                fi-hub
              </div>
              <h2
                className="display"
                style={{
                  fontSize: 'clamp(44px, 6vw, 92px)',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.035em',
                  marginBottom: 24,
                }}
              >
                Suivi patrimonial simplifié.
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink-soft)', maxWidth: 560, marginBottom: 34 }}>
                fi-hub aide à suivre ses comptes et son allocation dans une interface
                claire. L’objectif : réduire la friction entre les informations
                dispersées et les décisions à prendre.
              </p>

              <div style={{ display: 'grid', gap: 18, marginBottom: 40 }}>
                {FEATURES.map((feature, index) => (
                  <div
                    key={feature.title}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '52px 1fr',
                      gap: 18,
                      paddingTop: 18,
                      borderTop: '1px solid var(--ink-faint)',
                    }}
                  >
                    <span className="index-num" style={{ fontSize: 42, fontStyle: 'normal' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="display" style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: 'var(--ink-soft)', lineHeight: 1.65 }}>{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <a href="https://fi-hub.subleet.com" target="_blank" rel="noopener noreferrer" className="btn-ember">
                  Ouvrir l&apos;app ↗
                </a>
                <Link href="/contact?subject=fihub" className="btn-ghost">
                  Nous contacter
                </Link>
              </div>
            </div>

            <div
              style={{
                background: 'var(--noir)',
                color: 'var(--paper)',
                padding: 'clamp(28px, 4vw, 56px)',
                borderLeft: '1px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    background: 'var(--noir-soft)',
                    border: '1px solid rgba(236,223,203,0.14)',
                    padding: 'clamp(20px, 3vw, 34px)',
                    boxShadow: '10px 10px 0 var(--ember)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
                    <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(236,223,203,0.45)' }}>
                      fi-hub
                    </span>
                    <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#86efac' }}>
                      Démo
                    </span>
                  </div>

                  <div className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(236,223,203,0.45)', marginBottom: 8 }}>
                    Portefeuille total
                  </div>
                  <div className="display" style={{ fontSize: 'clamp(52px, 7vw, 86px)', fontWeight: 600, color: 'var(--paper)', marginBottom: 20 }}>
                    85 170 <span className="display-italic" style={{ color: 'var(--ember)', fontWeight: 400 }}>€</span>
                  </div>

                  <svg viewBox="0 0 420 150" style={{ width: '100%', height: 170, overflow: 'visible', marginBottom: 24 }}>
                    <defs>
                      <linearGradient id="productsChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.44" />
                        <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[30, 60, 90, 120].map(y => (
                      <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="rgba(236,223,203,0.07)" />
                    ))}
                    <path d="M0,118 C44,110 62,88 110,90 C160,92 170,60 220,64 C270,68 282,38 330,40 C374,42 390,24 420,18" fill="none" stroke="var(--ember)" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M0,118 C44,110 62,88 110,90 C160,92 170,60 220,64 C270,68 282,38 330,40 C374,42 390,24 420,18 L420,150 L0,150 Z" fill="url(#productsChart)" />
                  </svg>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid rgba(236,223,203,0.10)' }}>
                    {ACCOUNTS.map((account, index) => (
                      <div
                        key={account.label}
                        style={{
                          padding: '16px 12px 0',
                          borderRight: index < ACCOUNTS.length - 1 ? '1px solid rgba(236,223,203,0.10)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: account.tone }} />
                          <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(236,223,203,0.42)' }}>
                            {account.label}
                          </span>
                        </div>
                        <strong style={{ color: 'var(--paper)', fontSize: 16 }}>{account.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

