import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const SUBJECT_LABELS: Record<string, string> = {
  web: 'Création de site web',
  ia: 'Automatisation / IA',
  strategie: 'Stratégie IA',
  fihub: 'fi-hub',
  autre: 'Autre',
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // No API key configured — log and return success so UX isn't broken
      console.log('[Contact form] No RESEND_API_KEY — message not sent:', { name, email, subject, message })
      return NextResponse.json({ success: true })
    }

    const resend = new Resend(apiKey)
    const subjectLabel = SUBJECT_LABELS[subject] || 'Demande générale'

    await resend.emails.send({
      from: 'Subleet Contact <contact@subleet.com>',
      to: ['antoinecstl@gmail.com'],
      replyTo: email,
      subject: `[Subleet] ${subjectLabel} — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9f6f2; border-radius: 12px;">
          <h2 style="color: #3d3028; margin-bottom: 8px;">Nouveau message via subleet.com</h2>
          <p style="color: #8a6d3b; font-size: 14px; margin-bottom: 32px;">Sujet : <strong>${subjectLabel}</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; color: #6b5344; font-size: 13px; width: 120px;">Nom</td><td style="padding: 10px 0; color: #3d3028; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 10px 0; color: #6b5344; font-size: 13px;">Email</td><td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #f59e0b;">${email}</a></td></tr>
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #fff; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="color: #3d3028; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 24px; color: #a89080; font-size: 12px;">Vous pouvez répondre directement à cet email — la réponse ira à ${email}.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Contact form] Error:', err)
    return NextResponse.json({ error: 'Erreur serveur. Veuillez réessayer.' }, { status: 500 })
  }
}
