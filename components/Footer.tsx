'use client'

import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Index', href: '/', no: '00' },
  { label: 'Produits', href: '/products', no: '01' },
  { label: 'Blog', href: '/blog', no: '02' },
  { label: 'Contact', href: '/contact', no: '03' },
]

const PRODUCTS = [
  { label: 'fi-hub', href: 'https://fi-hub.subleet.com', status: 'Live' },
]

const LEGAL = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer
      style={{
        background: 'var(--paper-warm)',
        borderTop: '1px solid var(--ink)',
        position: 'relative',
        marginTop: 'auto',
        zIndex: 1,
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--ink-faint)',
          padding: 'clamp(48px, 8vw, 96px) clamp(20px, 4vw, 56px) clamp(32px, 5vw, 56px)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          className="display"
          style={{
            fontSize: 'clamp(96px, 22vw, 360px)',
            fontWeight: 500,
            lineHeight: 0.82,
            letterSpacing: '-0.05em',
            color: 'var(--ink)',
            userSelect: 'none',
          }}
        >
          Subleet<span style={{ color: 'var(--ember)', fontWeight: 400 }}>.</span>
        </div>
        <div
          className="display-italic"
          style={{
            marginTop: 12,
            fontSize: 'clamp(18px, 2vw, 26px)',
            color: 'var(--ink-soft)',
            fontWeight: 400,
          }}
        >
          Produits logiciels, IA appliquée et interfaces métier.
        </div>
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: 'clamp(48px, 6vw, 80px) clamp(20px, 4vw, 56px) 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
        }}
      >
        <div>
          <h4 className="eyebrow" style={{ marginBottom: 18 }}>Subleet</h4>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--ink-soft)',
              maxWidth: 280,
              marginBottom: 18,
            }}
          >
            Conception de produits logiciels, systèmes IA et plateformes métier
            pour projets ambitieux.
          </p>
        </div>

        <div>
          <h4 className="eyebrow" style={{ marginBottom: 18 }}>Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NAV_LINKS.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="draw-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    gap: 10,
                    fontFamily: 'var(--font-body), sans-serif',
                    fontSize: 15,
                    color: 'var(--ink)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-muted)' }}>{l.no}</span>
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow" style={{ marginBottom: 18 }}>Produits</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRODUCTS.map(p => (
              <li key={p.label}>
                <Link
                  href={p.href}
                  target={p.href.startsWith('http') ? '_blank' : undefined}
                  rel={p.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    className="display"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {p.label}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      color: 'var(--ember-hot)',
                    }}
                  >
                    ● {p.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow" style={{ marginBottom: 18 }}>Contact</h4>
          <a
            href="mailto:contact@subleet.com"
            className="display draw-link"
            style={{
              display: 'inline-block',
              fontSize: 24,
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              marginBottom: 18,
            }}
          >
            contact<span style={{ color: 'var(--ember)' }}>@</span>subleet.com
          </a>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '20px clamp(20px, 4vw, 56px) 28px',
          borderTop: '1px solid var(--ink-faint)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--ink-muted)',
        }}
      >
        <span>© {year} Subleet — Tous droits réservés.</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {LEGAL.map(l => (
            <Link key={l.href} href={l.href} className="draw-link">{l.label}</Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
