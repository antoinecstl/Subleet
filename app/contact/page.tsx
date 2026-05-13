'use client'

import { useState } from 'react'

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
  website: string
}

type Status = 'idle' | 'sending' | 'success' | 'error'

const SUBJECTS = [
  { value: 'product', label: 'Produit SaaS / plateforme' },
  { value: 'ia', label: 'IA appliquée / agents' },
  { value: 'fihub', label: 'fi-hub' },
  { value: 'autre', label: 'Autre demande' },
]

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [focused, setFocused] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    boxSizing: 'border-box',
    background: focused === field ? 'rgba(236,223,203,0.72)' : 'rgba(236,223,203,0.36)',
    border: `1px solid ${focused === field ? 'var(--ember)' : 'var(--ink-faint)'}`,
    borderRadius: 0,
    padding: '15px 16px',
    color: 'var(--ink)',
    fontFamily: 'var(--font-body), sans-serif',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.25s ease, background 0.25s ease',
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
          website: form.website,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue')
      setStatus('success')
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', website: '' })
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: 'clamp(88px, 13vh, 150px) clamp(20px, 4vw, 56px) clamp(92px, 12vh, 150px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div
            className="grid-2"
            style={{
              display: 'grid',
              gridTemplateColumns: '0.92fr 1.08fr',
              gap: 'clamp(48px, 7vw, 96px)',
              alignItems: 'start',
            }}
          >
            <div>
              <div className="eyebrow eyebrow-ember" style={{ marginBottom: 18 }}>
                Contact
              </div>
              <h1
                className="display"
                style={{
                  fontSize: 'clamp(58px, 9vw, 132px)',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.04em',
                  marginBottom: 30,
                }}
              >
                Parlons de votre projet.
              </h1>
              <p
                style={{
                  maxWidth: 560,
                  fontSize: 'clamp(17px, 1.6vw, 20px)',
                  lineHeight: 1.75,
                  color: 'var(--ink-soft)',
                  marginBottom: 42,
                }}
              >
                Produit SaaS, système IA, plateforme interne ou besoin plus exploratoire :
                envoyez le contexte et les contraintes. Nous reviendrons avec une
                première lecture concrète.
              </p>

              <div style={{ display: 'grid', borderTop: '1px solid var(--ink-faint)' }}>
                {[
                  { label: 'Email', value: 'contact@subleet.com', href: 'mailto:contact@subleet.com' },
                  { label: 'Zone', value: 'France', href: null },
                  { label: 'Format', value: 'Projet court, produit ou accompagnement', href: null },
                ].map(item => (
                  <div
                    key={item.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: 20,
                      padding: '18px 0',
                      borderBottom: '1px solid var(--ink-faint)',
                    }}
                  >
                    <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--ink-muted)' }}>
                      {item.label}
                    </span>
                    {item.href ? (
                      <a href={item.href} className="draw-link" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                        {item.value}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)' }}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: 'var(--paper-warm)',
                border: '1px solid var(--ink)',
                boxShadow: '14px 14px 0 var(--ember)',
                padding: 'clamp(28px, 4vw, 52px)',
                position: 'relative',
              }}
            >
              {status === 'success' ? (
                <div style={{ padding: '32px 0' }}>
                  <div className="eyebrow eyebrow-ember" style={{ marginBottom: 16 }}>
                    Message envoyé
                  </div>
                  <h2 className="display" style={{ fontSize: 'clamp(42px, 5vw, 72px)', fontWeight: 500, color: 'var(--ink)', marginBottom: 18 }}>
                    Merci.
                  </h2>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.7, marginBottom: 28 }}>
                    Votre message a bien été transmis. Nous prendrons connaissance
                    du contexte avant de revenir vers vous.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-ghost"
                    type="button"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                    style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
                    aria-hidden="true"
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                    <input
                      placeholder="Nom *"
                      required
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      onFocus={() => setFocused('lastName')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle('lastName')}
                    />
                    <input
                      placeholder="Prénom *"
                      required
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      onFocus={() => setFocused('firstName')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle('firstName')}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                    <input
                      placeholder="E-mail *"
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle('email')}
                    />
                    <input
                      placeholder="Téléphone *"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle('phone')}
                    />
                  </div>

                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    onFocus={() => setFocused('subject')}
                    onBlur={() => setFocused(null)}
                    style={{ ...inputStyle('subject'), appearance: 'none', cursor: 'pointer', color: form.subject ? 'var(--ink)' : 'var(--ink-muted)' }}
                  >
                    <option value="">Sujet de votre demande...</option>
                    {SUBJECTS.map(subject => (
                      <option key={subject.value} value={subject.value}>{subject.label}</option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Décrivez le besoin, le contexte et les contraintes... *"
                    required
                    rows={7}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused(null)}
                    style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 170 }}
                  />

                  {status === 'error' && (
                    <p style={{ fontSize: 14, color: '#8b1e1e', background: 'rgba(139,30,30,0.08)', padding: '12px 14px', border: '1px solid rgba(139,30,30,0.24)' }}>
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="btn-stamp"
                    style={{
                      opacity: status === 'sending' ? 0.65 : 1,
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      justifyContent: 'center',
                      marginTop: 8,
                    }}
                  >
                    {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
