import type { Metadata } from 'next'
import { ACCENT } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Produits',
  description: 'Découvrez l\'écosystème Subleet : fi-hub et nos futurs produits.',
}

const TAGS = ['Temps réel', 'Multi-comptes', 'Analyse performance', 'Allocation', 'Sécurisé']

const ACCOUNTS = [
  { l: 'PEA', v: '€24,350', c: '#f59e0b' },
  { l: 'CTO', v: '€18,720', c: '#5c9cfc' },
  { l: 'Livret A', v: '€12,000', c: '#4ade80' },
  { l: 'AV', v: '€30,100', c: '#e879a0' },
]

export default function ProductsPage() {
  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '80px clamp(24px, 5vw, 80px) 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Nos produits</span>
          <h1 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 56px)', color: '#3d3028', letterSpacing: '-0.03em', marginTop: 12 }}>Écosystème Subleet</h1>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 17, color: 'rgba(61,48,40,0.55)', maxWidth: 560, margin: '16px auto 0', lineHeight: 1.7 }}>Des produits conçus pour résoudre des problèmes concrets avec élégance.</p>
        </div>
      </section>

      <section style={{ padding: '40px clamp(24px, 5vw, 80px) 120px' }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          background: '#fff', border: '1px solid rgba(61,48,40,0.08)',
          borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(61,48,40,0.06)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 480 }} className="hero-grid">
            <div style={{ padding: 'clamp(32px, 4vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-poppins), sans-serif' }}>f</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 22, color: '#3d3028' }}>fi-hub</div>
                  <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: ACCENT, background: ACCENT + '12', padding: '2px 8px', borderRadius: 4 }}>SaaS</span>
                </div>
              </div>
              <h2 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', color: '#3d3028', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
                Tout votre patrimoine, un seul regard
              </h2>
              <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, color: 'rgba(61,48,40,0.55)', lineHeight: 1.8, marginBottom: 28 }}>
                fi-hub centralise PEA, comptes-titres, livrets d&apos;épargne et assurances-vie dans un tableau de bord unifié. Valorisation en temps réel, analyse de performance, et vue consolidée de votre allocation.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {TAGS.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, fontWeight: 500,
                    color: 'rgba(61,48,40,0.6)', background: 'rgba(61,48,40,0.04)',
                    border: '1px solid rgba(61,48,40,0.08)', borderRadius: 6, padding: '5px 12px',
                  }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="https://fi-hub.subleet.com" target="_blank" rel="noopener noreferrer" style={{
                  background: '#3d3028', border: 'none', borderRadius: 8,
                  padding: '12px 24px', color: '#f0ebe4',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
                  boxShadow: '0 4px 16px rgba(61,48,40,0.15)',
                }}>Accéder à fi-hub →</a>
                <a href="/contact?subject=fihub" style={{
                  background: 'transparent', border: '1px solid rgba(61,48,40,0.15)',
                  borderRadius: 8, padding: '12px 20px', color: 'rgba(61,48,40,0.7)',
                  fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
                }}>Nous contacter</a>
              </div>
            </div>

            <div style={{
              background: '#2c2218', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(240,235,228,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(240,235,228,0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
              <div style={{ width: '100%', maxWidth: 340, position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(10,10,18,0.5)', borderRadius: 14, border: '1px solid rgba(240,235,228,0.08)', padding: 20, marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'rgba(240,235,228,0.4)', marginBottom: 8 }}>Patrimoine total</div>
                  <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 28, fontWeight: 800, color: '#f0ebe4' }}>€85,170</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: '#4ade80', marginTop: 4 }}>▲ +12.4% ce mois</div>
                  <svg viewBox="0 0 280 50" style={{ width: '100%', height: 50, marginTop: 12 }}>
                    <defs>
                      <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,40 Q35,38 70,32 T140,22 T210,26 T280,8" fill="none" stroke={ACCENT} strokeWidth="2" />
                    <path d="M0,40 Q35,38 70,32 T140,22 T210,26 T280,8 L280,50 L0,50Z" fill="url(#pg2)" />
                  </svg>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ACCOUNTS.map(a => (
                    <div key={a.l} style={{ background: 'rgba(10,10,18,0.5)', borderRadius: 10, border: '1px solid rgba(240,235,228,0.05)', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.c }} />
                        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: 'rgba(240,235,228,0.4)' }}>{a.l}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 15, fontWeight: 700, color: '#f0ebe4' }}>{a.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 clamp(24px, 5vw, 80px) 120px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h3 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 20, color: 'rgba(61,48,40,0.4)', marginBottom: 24 }}>Prochainement</h3>
          <div style={{
            background: 'rgba(61,48,40,0.03)', border: '1px dashed rgba(61,48,40,0.12)',
            borderRadius: 16, padding: 40, textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.4)' }}>
              D&apos;autres produits sont en cours de développement. Restez connectés.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
