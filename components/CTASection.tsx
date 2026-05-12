'use client'

import Link from 'next/link'
import AnimatedSection from './AnimatedSection'

export default function CTASection() {
  return (
    <section
      style={{
        padding: 'clamp(100px, 14vh, 180px) clamp(20px, 4vw, 56px)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <AnimatedSection>
          <div
            style={{
              position: 'relative',
              padding: 'clamp(48px, 8vw, 96px) clamp(28px, 5vw, 80px)',
              background: 'var(--paper-warm)',
              border: '1px solid var(--ink)',
              boxShadow: '14px 14px 0 var(--ember), 14px 14px 0 1px var(--ink)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 24,
                paddingBottom: 18,
                borderBottom: '1px solid var(--ink)',
                marginBottom: 40,
                flexWrap: 'wrap',
              }}
            >
              <span className="eyebrow eyebrow-ember">Contact</span>
              <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--ink)' }}>
                Subleet
              </span>
            </div>

            <div
              className="grid-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: 'clamp(32px, 4vw, 64px)',
                alignItems: 'end',
              }}
            >
              <div>
                <h2
                  className="display"
                  style={{
                    fontSize: 'clamp(48px, 7vw, 116px)',
                    fontWeight: 500,
                    lineHeight: 0.92,
                    letterSpacing: '-0.035em',
                    color: 'var(--ink)',
                  }}
                >
                  Un projet ?<br />
                  <span className="display-italic" style={{ color: 'var(--ember-hot)', fontWeight: 400 }}>
                    Parlons-en
                  </span>{' '}
                  simplement.
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: 'var(--ink-soft)',
                    maxWidth: 420,
                  }}
                >
                  Décrivez votre besoin, votre contexte et vos contraintes. Nous
                  vous répondrons avec une première lecture concrète de la suite.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <Link href="/contact" className="btn-stamp">
                    Démarrer la conversation
                  </Link>
                  <a href="mailto:contact@subleet.com" className="btn-ghost">
                    contact@subleet.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

