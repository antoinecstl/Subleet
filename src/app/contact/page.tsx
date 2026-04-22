'use client'

import { useState } from 'react'

const ACCENT = '#f59e0b'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true) }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(61,48,40,0.03)',
    border: `1px solid ${focused === field ? ACCENT + '50' : 'rgba(61,48,40,0.1)'}`,
    borderRadius: 10, padding: '14px 16px',
    color: '#3d3028', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15,
    outline: 'none', transition: 'border-color 0.3s',
  })

  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '80px clamp(24px, 5vw, 80px) 120px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="hero-grid">
          <div>
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Contact</span>
            <h1 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', color: '#3d3028', letterSpacing: '-0.03em', marginTop: 12, marginBottom: 20 }}>
              Parlons de votre projet
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 17, color: 'rgba(61,48,40,0.55)', lineHeight: 1.8, marginBottom: 48 }}>
              Vous avez un besoin en développement web, en automatisation IA, ou vous souhaitez discuter d&apos;une stratégie digitale ? Nous sommes à votre écoute.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { label: 'Email', value: 'contact@subleet.com', icon: '✉' },
                { label: 'Basé à', value: 'France', icon: '◎' },
                { label: 'Réponse sous', value: '24 heures', icon: '◷' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: ACCENT + '12', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: ACCENT,
                  }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'rgba(61,48,40,0.45)' }}>{c.label}</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: '#3d3028', fontWeight: 500 }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: '#fff', border: '1px solid rgba(61,48,40,0.08)',
            borderRadius: 20, padding: 'clamp(28px, 3vw, 40px)',
            boxShadow: '0 8px 40px rgba(61,48,40,0.06)',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: ACCENT }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 22, color: '#3d3028', marginBottom: 8 }}>Message envoyé</h3>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.5)' }}>Nous reviendrons vers vous très rapidement.</p>
                <button onClick={() => setSent(false)} style={{
                  marginTop: 24, background: 'transparent', border: `1px solid ${ACCENT}40`,
                  borderRadius: 8, padding: '10px 20px', color: ACCENT,
                  fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, cursor: 'pointer',
                }}>Envoyer un autre message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <input placeholder="Nom" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                    style={inputStyle('name')} />
                  <input placeholder="Email" type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    style={inputStyle('email')} />
                </div>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('subject'), appearance: 'none' }}>
                  <option value="">Sujet…</option>
                  <option value="web">Création de site web</option>
                  <option value="ia">Automatisation / IA</option>
                  <option value="strategie">Stratégie IA</option>
                  <option value="fihub">fi-hub</option>
                  <option value="autre">Autre</option>
                </select>
                <textarea placeholder="Votre message…" required rows={5} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocused('msg')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('msg'), resize: 'vertical', minHeight: 120 }} />
                <button type="submit" style={{
                  background: '#3d3028', border: 'none', borderRadius: 10,
                  padding: '14px 28px', color: '#f0ebe4',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(61,48,40,0.15)', transition: 'all 0.3s', marginTop: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
                >Envoyer le message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
