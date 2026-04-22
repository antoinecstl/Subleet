import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — Subleet',
}

const ACCENT = '#f59e0b'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 'clamp(18px, 2vw, 22px)', color: '#3d3028', marginBottom: 16, letterSpacing: '-0.01em' }}>{title}</h2>
    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.7)', lineHeight: 1.85 }}>{children}</div>
  </div>
)

export default function MentionsLegalesPage() {
  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '72px clamp(20px, 5vw, 80px) 120px', maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.5)', textDecoration: 'none', marginBottom: 40 }}>← Retour</Link>

        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Légal</span>
        <h1 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', color: '#3d3028', letterSpacing: '-0.03em', marginTop: 12, marginBottom: 48 }}>Mentions légales</h1>

        <Section title="Éditeur du site">
          <p>Le site <strong>subleet.com</strong> est édité par Subleet, entreprise individuelle.</p>
          <p style={{ marginTop: 12 }}>Responsable de la publication : Antoine Castel</p>
          <p>Contact : <a href="mailto:contact@subleet.com" style={{ color: ACCENT, textDecoration: 'none' }}>contact@subleet.com</a></p>
        </Section>

        <Section title="Hébergement">
          <p>Ce site est hébergé par <strong>Vercel Inc.</strong></p>
          <p style={{ marginTop: 8 }}>340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
          <p><a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>vercel.com</a></p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>L'ensemble du contenu de ce site (textes, images, visuels, logotypes, code source) est la propriété exclusive de Subleet et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
          <p style={{ marginTop: 12 }}>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.</p>
        </Section>

        <Section title="Responsabilité">
          <p>Subleet s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Subleet ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.</p>
          <p style={{ marginTop: 12 }}>Subleet se réserve le droit de corriger à tout moment le contenu du site et décline toute responsabilité pour tout dommage résultant d'une intrusion frauduleuse ou d'une utilisation des informations publiées.</p>
        </Section>

        <Section title="Liens hypertextes">
          <p>Le site peut contenir des liens vers des sites tiers. Subleet n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leurs pratiques.</p>
        </Section>

        <Section title="Droit applicable">
          <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, et après échec de toute tentative de résolution amiable, les tribunaux français seront seuls compétents.</p>
        </Section>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(61,48,40,0.03)', borderRadius: 12, border: '1px solid rgba(61,48,40,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.4)' }}>Dernière mise à jour : avril 2026</p>
        </div>
      </section>
    </div>
  )
}
