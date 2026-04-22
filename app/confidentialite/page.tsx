import type { Metadata } from 'next'
import Link from 'next/link'
import { ACCENT } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 'clamp(18px, 2vw, 22px)', color: '#3d3028', marginBottom: 16, letterSpacing: '-0.01em' }}>{title}</h2>
    <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.7)', lineHeight: 1.85 }}>{children}</div>
  </div>
)

const Li = ({ children }: { children: React.ReactNode }) => (
  <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT, marginTop: 9, flexShrink: 0 }} />
    <span>{children}</span>
  </li>
)

export default function ConfidentialitePage() {
  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '72px clamp(20px, 5vw, 80px) 120px', maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.5)', textDecoration: 'none', marginBottom: 40 }}>← Retour</Link>

        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Légal</span>
        <h1 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)', color: '#3d3028', letterSpacing: '-0.03em', marginTop: 12, marginBottom: 48 }}>Politique de confidentialité</h1>

        <Section title="Responsable du traitement">
          <p>Subleet, représentée par Antoine Castel, est responsable du traitement des données personnelles collectées via le site <strong>subleet.com</strong>.</p>
          <p style={{ marginTop: 12 }}>Contact DPO : <a href="mailto:contact@subleet.com" style={{ color: ACCENT, textDecoration: 'none' }}>contact@subleet.com</a></p>
        </Section>

        <Section title="Données collectées">
          <p>Dans le cadre de l'utilisation du formulaire de contact, nous collectons les données suivantes :</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0' }}>
            <Li>Nom et prénom</Li>
            <Li>Adresse email</Li>
            <Li>Sujet et contenu du message</Li>
          </ul>
          <p style={{ marginTop: 12 }}>Ces données sont collectées uniquement avec votre consentement explicite et ne sont utilisées que pour répondre à votre demande.</p>
        </Section>

        <Section title="Finalités du traitement">
          <p>Vos données sont traitées pour :</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0' }}>
            <Li>Répondre à vos demandes de contact et de renseignement</Li>
            <Li>Assurer le suivi commercial des prospects qui en font la demande</Li>
            <Li>Améliorer la qualité de nos services</Li>
          </ul>
        </Section>

        <Section title="Durée de conservation">
          <p>Les données collectées via le formulaire de contact sont conservées pendant <strong>3 ans</strong> à compter du dernier contact, sauf demande de suppression de votre part.</p>
        </Section>

        <Section title="Partage des données">
          <p>Subleet ne vend, ne loue et ne partage pas vos données personnelles avec des tiers à des fins commerciales. Vos données peuvent être transmises à nos prestataires techniques (hébergement, envoi d'email) dans le strict cadre de l'exécution de leurs services, et uniquement dans les limites nécessaires à ces traitements.</p>
        </Section>

        <Section title="Vos droits">
          <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0' }}>
            <Li><strong>Droit d'accès</strong> — consulter les données que nous détenons vous concernant</Li>
            <Li><strong>Droit de rectification</strong> — corriger des données inexactes</Li>
            <Li><strong>Droit à l'effacement</strong> — demander la suppression de vos données</Li>
            <Li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré</Li>
            <Li><strong>Droit d'opposition</strong> — vous opposer au traitement de vos données</Li>
          </ul>
          <p style={{ marginTop: 16 }}>Pour exercer ces droits, contactez-nous à <a href="mailto:contact@subleet.com" style={{ color: ACCENT, textDecoration: 'none' }}>contact@subleet.com</a>. Vous pouvez également adresser une réclamation à la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>CNIL</a>.</p>
        </Section>

        <Section title="Cookies">
          <p>Ce site n'utilise pas de cookies de traçage ou publicitaires. Les seuls cookies éventuellement déposés sont des cookies techniques nécessaires au bon fonctionnement du site (session, préférences), qui n'impliquent pas de traitement de données personnelles.</p>
        </Section>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(61,48,40,0.03)', borderRadius: 12, border: '1px solid rgba(61,48,40,0.06)' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.4)' }}>Dernière mise à jour : avril 2026</p>
        </div>
      </section>
    </div>
  )
}
