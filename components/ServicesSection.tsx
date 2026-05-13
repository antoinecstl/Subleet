'use client'

import { useState } from 'react'
import Link from 'next/link'
import AnimatedSection from './AnimatedSection'

type Service = {
  no: string
  title: string
  tag: string
  desc: string
  href: string
  cta: string
}

const SERVICES: Service[] = [
  {
    no: '01',
    title: 'SaaS & produits logiciels',
    tag: 'Produit · Architecture',
    desc:
      'Nous concevons des produits logiciels avec une logique métier solide, une architecture maintenable et une interface pensée pour un usage réel.',
    href: '/products',
    cta: 'Voir les produits',
  },
  {
    no: '02',
    title: 'IA appliquée',
    tag: 'Agents · Workflows · RAG',
    desc:
      'Nous intégrons des systèmes IA dans des flux concrets : assistants internes, agents outillés, recherche augmentée, extraction et automatisation fiable.',
    href: '/contact',
    cta: 'Explorer un cas d’usage',
  },
  {
    no: '03',
    title: 'Plateformes & interfaces métier',
    tag: 'UX technique · Delivery',
    desc:
      'Nous transformons des parcours complexes en outils rapides, lisibles et crédibles : portails, dashboards, back-offices et expériences web avancées.',
    href: '/contact',
    cta: 'Discuter d\'un système',
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
          gridTemplateColumns: '110px minmax(260px, 0.8fr) minmax(340px, 1.2fr) auto',
          gap: 36,
          padding: '36px 0',
          borderTop: '1px solid var(--ink-faint)',
          alignItems: 'center',
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

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              whiteSpace: 'nowrap',
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
                Trois leviers pour construire plus loin.
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
              Nous partons des usages, puis nous choisissons la bonne couche :
              produit logiciel, système IA ou interface métier. L’objectif reste
              le même : créer un avantage technique exploitable.
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
