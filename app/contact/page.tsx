'use client'

import { useState } from 'react'

const ACCENT = '#f59e0b'

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}
type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [focused, setFocused] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(61,48,40,0.03)',
    border: `1px solid ${focused === field ? ACCENT + '60' : 'rgba(61,48,40,0.1)'}`,
    borderRadius: 10, padding: '14px 16px',
    color: '#3d3028', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15,
    outline: 'none', transition: 'border-color 0.3s',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const name = `${form.firstName} ${form.lastName}`.trim()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue')
      setStatus('success')
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '72px clamp(20px, 5vw, 80px) 120px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="hero-grid">

          {/* Left — info */}
          <div>
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Contact</span>
            <h1 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 46px)', color: '#3d3028', letterSpacing: '-0.03em', marginTop: 12, marginBottom: 20, lineHeight: 1.15 }}>
              Parlons de votre projet
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 17, color: 'rgba(61,48,40,0.55)', lineHeight: 1.8, marginBottom: 48 }}>
              Besoin d'un site web, d'une automatisation IA ou d'une réflexion sur votre stratégie digitale ? Nous sommes à votre écoute.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { label: 'Email', value: 'contact@subleet.com', icon: '✉', href: 'mailto:contact@subleet.com' },
                { label: 'Basé en', value: 'France', icon: '◎', href: null },
                { label: 'Réponse sous', value: '24 heures', icon: '◷', href: null },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: ACCENT + '12', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: ACCENT,
                  }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'rgba(61,48,40,0.45)' }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: '#3d3028', fontWeight: 500, textDecoration: 'none' }}>{c.value}</a>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: '#3d3028', fontWeight: 500 }}>{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{
            background: '#fff', border: '1px solid rgba(61,48,40,0.08)',
            borderRadius: 20, padding: 'clamp(24px, 3vw, 40px)',
            boxShadow: '0 8px 40px rgba(61,48,40,0.06)',
          }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: ACCENT }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 22, color: '#3d3028', marginBottom: 8 }}>Message envoyé !</h3>
                <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.5)', lineHeight: 1.6 }}>Nous vous répondrons dans les 24 heures.</p>
                <button onClick={() => setStatus('idle')} style={{
                  marginTop: 24, background: 'transparent', border: `1px solid ${ACCENT}40`,
                  borderRadius: 8, padding: '10px 20px', color: ACCENT,
                  fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, cursor: 'pointer',
                }}>Envoyer un autre message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <input placeholder="Nom *" required value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                    style={inputStyle('lastName')} />
                  <input placeholder="Prénom *" required value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                    style={inputStyle('firstName')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <input placeholder="E-mail *" type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                    style={inputStyle('email')} />
                  <input placeholder="Téléphone *" type="tel" required value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                    style={inputStyle('phone')} />
                </div>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('subject'), appearance: 'none', cursor: 'pointer', color: form.subject ? '#3d3028' : 'rgba(61,48,40,0.45)' }}>
                  <option value="">Sujet de votre demande…</option>
                  <option value="web">Création de site web</option>
                  <option value="ia">Automatisation / IA</option>
                  <option value="strategie">Stratégie IA</option>
                  <option value="fihub">fi-hub</option>
                  <option value="autre">Autre</option>
                </select>
                <textarea placeholder="Décrivez votre projet ou votre besoin… *" required rows={5} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  onFocus={() => setFocused('msg')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('msg'), resize: 'vertical', minHeight: 120 }} />

                {status === 'error' && (
                  <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: '#e53e3e', background: '#fff5f5', padding: '10px 14px', borderRadius: 8, border: '1px solid #fed7d7' }}>
                    {errorMsg}
                  </p>
                )}

                <button type="submit" disabled={status === 'sending'} style={{
                  background: status === 'sending' ? 'rgba(61,48,40,0.5)' : '#3d3028',
                  border: 'none', borderRadius: 10,
                  padding: '14px 28px', color: '#f0ebe4',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 15, fontWeight: 600, cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(61,48,40,0.15)', transition: 'all 0.3s', marginTop: 4,
                }}
                onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
                >
                  {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
