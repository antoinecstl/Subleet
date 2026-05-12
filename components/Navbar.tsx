'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Index', href: '/', no: '00' },
  { label: 'Produits', href: '/products', no: '01' },
  { label: 'Blog', href: '/blog', no: '02' },
  { label: 'Contact', href: '/contact', no: '03' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? 'rgba(236, 223, 203, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px) saturate(1.1)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(1.1)' : 'none',
        borderBottom: scrolled ? '1px solid var(--ink-faint)' : '1px solid transparent',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}
    >
      <div style={{
        height: 4,
        borderTop: '1px solid var(--ink-faint)',
        borderBottom: '1px solid var(--ink-faint)',
      }} />

      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 56px)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 32,
          height: 72,
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline' }}>
          <span
            className="display"
            style={{
              fontWeight: 800,
              fontSize: 28,
              color: 'var(--ink)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            Subleet
          </span>
        </Link>

        <div
          className="nav-desktop-only"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}
        >
          {NAV_LINKS.map(l => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className="draw-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 8,
                  color: active ? 'var(--ember-hot)' : 'var(--ink)',
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 10, color: active ? 'var(--ember)' : 'var(--ink-muted)' }}>
                  {l.no}
                </span>
                <span>{l.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="nav-desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/contact" className="btn-stamp" style={{ padding: '12px 18px', fontSize: 11 }}>
            Démarrer →
          </Link>
        </div>

        <button
          className="nav-mobile-btn"
          aria-label={mobileOpen ? 'Fermer' : 'Ouvrir le menu'}
          onClick={() => setMobileOpen(o => !o)}
          style={{
            display: 'none',
            gridColumn: 3,
            background: 'transparent',
            border: '1px solid var(--ink)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono), monospace',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            padding: '10px 14px',
            borderRadius: 0,
          }}
        >
          {mobileOpen ? 'Fermer' : 'Menu'}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="nav-mobile-only"
          style={{
            background: 'var(--paper)',
            borderTop: '1px solid var(--ink-faint)',
            padding: '28px clamp(20px, 5vw, 56px) 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {NAV_LINKS.map(l => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '18px 0',
                  borderBottom: '1px solid var(--ink-faint)',
                }}
              >
                <span
                  className="display"
                  style={{
                    fontSize: 36,
                    fontWeight: 600,
                    color: active ? 'var(--ember-hot)' : 'var(--ink)',
                    fontStyle: active ? 'italic' : 'normal',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {l.label}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{l.no}</span>
              </Link>
            )
          })}
          <Link href="/contact" className="btn-ember" style={{ marginTop: 28, alignSelf: 'flex-start' }}>
            Démarrer une conversation
          </Link>
        </div>
      )}
    </nav>
  )
}

