import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const SUBJECT_LABELS: Record<string, string> = {
  web: 'Création de site web',
  ia: 'Automatisation / IA',
  strategie: 'Stratégie IA',
  fihub: 'fi-hub',
  autre: 'Autre',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LEN = { name: 120, email: 160, phone: 40, message: 4000 }

// Per-instance token bucket: 5 submissions / 10 min / IP.
// Serverless-weak (resets on cold start) but raises the bar for scripted spam.
const RATE_WINDOW_MS = 10 * 60_000
const RATE_MAX = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const prev = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  if (prev.length >= RATE_MAX) {
    hits.set(ip, prev)
    return true
  }
  prev.push(now)
  hits.set(ip, prev)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every(t => now - t >= RATE_WINDOW_MS)) hits.delete(k)
  }
  return false
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
    }

    const { name, email, phone, subject, message, website } = body as Record<string, unknown>

    // Honeypot: legit users never fill this hidden field.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true })
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof message !== 'string'
    ) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
    }

    const n = name.trim()
    const e = email.trim()
    const p = phone.trim()
    const m = message.trim()
    const s = typeof subject === 'string' ? subject.trim() : ''

    if (!n || !e || !p || !m) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
    }
    if (
      n.length > MAX_LEN.name ||
      e.length > MAX_LEN.email ||
      p.length > MAX_LEN.phone ||
      m.length > MAX_LEN.message
    ) {
      return NextResponse.json({ error: 'Message trop long.' }, { status: 400 })
    }
    if (!EMAIL_RE.test(e)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[Contact form] RESEND_API_KEY missing — cannot deliver message')
      return NextResponse.json(
        { error: 'Service email indisponible. Contactez-nous directement à contact@subleet.com.' },
        { status: 503 }
      )
    }

    const resend = new Resend(apiKey)
    const subjectLabel = SUBJECT_LABELS[s] || 'Demande générale'
    const fromEmail = 'contactform@contact.subleet.com'
    const toEmail = 'subleet@outlook.com'

    const safe = {
      name: escapeHtml(n),
      email: escapeHtml(e),
      phone: escapeHtml(p),
      message: escapeHtml(m),
      subject: escapeHtml(subjectLabel),
    }

    const { data, error } = await resend.emails.send({
      from: `Subleet Contact Form <${fromEmail}>`,
      to: [toEmail],
      replyTo: e,
      subject: `[Subleet] ${subjectLabel} — ${n}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f6f2; border-radius: 12px;">
          <h2 style="color: #3d3028; margin-bottom: 8px;">Nouveau message via subleet.com</h2>
          <p style="color: #8a6d3b; font-size: 14px; margin-bottom: 32px;">Sujet : <strong>${safe.subject}</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; color: #6b5344; font-size: 13px; width: 120px;">Nom</td><td style="padding: 10px 0; color: #3d3028; font-weight: 600;">${safe.name}</td></tr>
            <tr><td style="padding: 10px 0; color: #6b5344; font-size: 13px;">Email</td><td style="padding: 10px 0;"><a href="mailto:${safe.email}" style="color: #f59e0b;">${safe.email}</a></td></tr>
            <tr><td style="padding: 10px 0; color: #6b5344; font-size: 13px;">Téléphone</td><td style="padding: 10px 0; color: #3d3028; font-weight: 600;">${safe.phone}</td></tr>
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #fff; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="color: #3d3028; line-height: 1.7; margin: 0; white-space: pre-wrap;">${safe.message}</p>
          </div>
          <p style="margin-top: 24px; color: #a89080; font-size: 12px;">Vous pouvez répondre directement à cet email — la réponse ira à ${safe.email}.</p>
        </div>
      `,
    })

    if (error) {
      console.error('[Contact form] Resend error:', error)
      return NextResponse.json({ error: 'Erreur email. Veuillez réessayer.' }, { status: 502 })
    }

    console.log('[Contact form] Email sent:', { id: data?.id, fromEmail, toEmail })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact form] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 })
  }
}
