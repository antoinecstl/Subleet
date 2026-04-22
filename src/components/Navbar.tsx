'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/products' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const ACCENT = '#f59e0b'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(234,226,216,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(61,48,40,0.08)' : '1px solid transparent',
      transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
      padding: '0 clamp(24px, 5vw, 80px)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/assets/logo.png" alt="Subleet" width={32} height={32} style={{ filter: 'brightness(0.2)' }} />
          <span style={{
            fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 22,
            color: '#3d3028', letterSpacing: '-0.02em',
          }}>Subleet</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="nav-desktop">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, fontWeight: 500,
              color: pathname === l.href ? ACCENT : 'rgba(61,48,40,0.6)',
              transition: 'color 0.3s',
              position: 'relative', padding: '4px 0',
              textDecoration: 'none',
            }}>
              {l.label}
              {pathname === l.href && (
                <span style={{
                  position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
                  background: ACCENT, borderRadius: 1,
                }} />
              )}
            </Link>
          ))}
          <Link href="/contact" style={{
            background: '#3d3028', border: 'none', borderRadius: 8,
            padding: '10px 22px', color: '#f0ebe4',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 14, fontWeight: 600,
            boxShadow: '0 2px 12px rgba(61,48,40,0.15)',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.3s',
            display: 'inline-block',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-1px)'
            el.style.boxShadow = '0 4px 20px rgba(61,48,40,0.25)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = ''
            el.style.boxShadow = '0 2px 12px rgba(61,48,40,0.15)'
          }}
          >Nous contacter</Link>
        </div>

        <button
          className="nav-mobile-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            color: '#3d3028', fontSize: 28, padding: 4,
          }}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div className="nav-mobile-menu" style={{
          background: 'rgba(240,235,228,0.97)', backdropFilter: 'blur(20px)',
          padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 18, fontWeight: 500,
              color: pathname === l.href ? ACCENT : '#3d3028',
              textDecoration: 'none',
            }}>{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
