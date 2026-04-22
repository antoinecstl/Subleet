'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACCENT = '#f59e0b'

const SERVICES = [
  { icon: '◆', title: 'Produits SaaS', desc: 'Nous concevons et opérons des plateformes SaaS innovantes pour des marchés à fort potentiel.', action: 'Voir fi-hub', href: '/products' },
  { icon: '◇', title: 'Création de sites web', desc: 'Design et développement de sites performants, pensés pour convertir et impressionner.', action: 'En savoir plus', href: '/contact' },
  { icon: '▲', title: 'Automatisation & IA', desc: "Agents IA, workflows automatisés et intégrations sur-mesure pour transformer vos opérations.", action: "Discuter d'un projet", href: '/contact' },
  { icon: '○', title: 'Stratégie IA', desc: "Audit, feuille de route et accompagnement pour intégrer l'intelligence artificielle dans votre entreprise.", action: 'Nous contacter', href: '/contact' },
]

function ServiceCard({ icon, title, desc, action, href }: { icon: string; title: string; desc: string; action: string; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${ACCENT}08` : 'rgba(61,48,40,0.03)',
        border: `1px solid ${hovered ? ACCENT + '25' : 'rgba(61,48,40,0.08)'}`,
        borderRadius: 16, padding: 32,
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'pointer', display: 'block', textDecoration: 'none',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${ACCENT}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, fontSize: 20, color: ACCENT,
        transition: 'transform 0.3s', transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 20, color: '#3d3028', marginBottom: 12 }}>{title}</h3>
      <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.55)', lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>
      <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, fontWeight: 600, color: ACCENT, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {action} <span style={{ transition: 'transform 0.3s', display: 'inline-block', transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}>→</span>
      </span>
    </Link>
  )
}

export default function ServicesSection() {
  return (
    <section style={{ padding: '120px clamp(24px, 5vw, 80px)', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Ce que nous faisons</span>
          <h2 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 48px)', color: '#3d3028', letterSpacing: '-0.02em', marginTop: 12 }}>Expertise tech, impact réel</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {SERVICES.map((s, i) => (
            <ServiceCard key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
