'use client'

import { useState } from 'react'
import Link from 'next/link'
import AnimatedSection from './AnimatedSection'

type Service = {
  no: string
  title: string
  tag: string
  desc: string
  meta: string[]
  href: string
  cta: string
}

const SERVICES: Service[] = [
  {
    no: '01',
    title: 'Produits SaaS',
    tag: 'Conception produit',
    desc:
      'Nous construisons des applications web avec une logique métier claire, une interface robuste et une base technique prête à évoluer.',
    meta: ['fi-hub', 'Produit en ligne'],
    href: '/products',
    cta: 'Voir fi-hub',
  },
  {
    no: '02',
    title: 'Sites & Interfaces',
    tag: 'Design et développement',
    desc:
      'Nous créons des sites rapides, lisibles et crédibles, avec une hiérarchie visuelle pensée pour guider l’utilisateur sans le perdre.',
    meta: [],
    href: '/contact',
    cta: 'Demander un devis',
  },
  {
    no: '03',
    title: 'Automatisation & IA',
    tag: 'Outils internes et workflows',
    desc:
      'Nous automatisons les tâches répétitives et connectons vos outils pour gagner du temps, fiabiliser les opérations et réduire les frictions.',
    meta: [],
    href: '/contact',
    cta: 'Discuter d\'un projet',
  },
]

function Row({ s, i }: { s: Service; i: number }) {
  const [hover, setHover] = useState(false)
  return (
    <AnimatedSection delay={i * 60}>
      <Link
        href={s.href}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="editorial-list-row"
        style={{
          display: 'grid',
          gridTemplateColumns: '120px minmax(0, 1fr) minmax(0, 1fr) 220px',
          gap: 32,
          padding: '36px 0',
          borderTop: '1px solid var(--ink-faint)',
          alignItems: 'baseline',
          position: 'relative',
          transition: 'background 0.4s ease, padding 0.4s ease',
          background: hover ? 'rgba(217,119,6,0.04)' : 'transparent',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: -24,
            top: 36,
            bottom: 36,
            width: 2,
            background: 'var(--ember)',
            transformOrigin: 'top center',
            transform: hover ? 'scaleY(1)' : 'scaleY(0)',
            transition: 'transform 0.5s cubic-bezier(0.77, 0, 0.175, 1)',
          }}
        />

        <span
          className="index-num"
          style={{
            fontSize: 'clamp(64px, 7vw, 96px)',
            fontStyle: hover ? 'italic' : 'normal',
            color: hover ? 'var(--ember-hot)' : 'var(--ember)',
            transition: 'color 0.4s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1), font-style 0.4s ease',
            transform: hover ? 'translateX(6px)' : 'none',
          }}
        >
          {s.no}
        </span>

        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{s.tag}</div>
          <h3
            className="display"
            style={{
              fontSize: 'clamp(28px, 3vw, 44px)',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
              fontStyle: hover ? 'italic' : 'normal',
              fontVariationSettings: hover ? '"opsz" 144, "SOFT" 100' : '"opsz" 144, "SOFT" 50',
              transition: 'font-style 0.4s ease',
            }}
          >
            {s.title}
          </h3>
        </div>

        <p
          className="ed-desc"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--ink-soft)',
            maxWidth: 520,
          }}
        >
          {s.desc}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
          {s.meta.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.meta.map(m => (
                <span
                  key={m}
                  className="mono"
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--ink-muted)',
                  }}
                >
                  · {m}
                </span>
              ))}
            </div>
          )}

          <span
            className="mono"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: hover ? 'var(--ember-hot)' : 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid currentColor',
              paddingBottom: 4,
              transition: 'color 0.3s ease, gap 0.3s ease',
            }}
          >
            {s.cta}
            <span style={{ transition: 'transform 0.3s ease', transform: hover ? 'translateX(6px)' : 'none' }}>→</span>
          </span>
        </div>
      </Link>
    </AnimatedSection>
  )
}

export default function ServicesSection() {
  return (
    <section
      id="services"
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 4vw, 56px)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <AnimatedSection>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              marginBottom: 64,
              alignItems: 'end',
            }}
            className="grid-2"
          >
            <div>
              <div className="eyebrow eyebrow-ember" style={{ marginBottom: 18 }}>
                Expertises
              </div>
              <h2
                className="display"
                style={{
                  fontSize: 'clamp(44px, 6vw, 96px)',
                  fontWeight: 500,
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                  color: 'var(--ink)',
                }}
              >
                Trois façons de construire plus vite.
              </h2>
            </div>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: 'var(--ink-soft)',
                maxWidth: 520,
                justifySelf: 'end',
              }}
            >
              Du cadrage à la mise en ligne, nous privilégions les interfaces
              compréhensibles, les choix techniques sobres et les livrables réellement utilisables.
            </p>
          </div>
        </AnimatedSection>

        <hr className="rule-ember" style={{ marginBottom: 8 }} />

        <div role="list">
          {SERVICES.map((s, i) => (
            <Row key={s.no} s={s} i={i} />
          ))}
        </div>

        <hr className="rule" style={{ marginTop: 0 }} />
      </div>
    </section>
  )
}

