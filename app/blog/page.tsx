'use client'

import { useState } from 'react'

const ACCENT = '#f59e0b'

const BLOG_POSTS = [
  { id: 1, title: "Comment l'IA transforme la gestion de patrimoine", cat: 'IA', date: '18 Avr 2026', excerpt: "L'intelligence artificielle ouvre de nouvelles perspectives pour les investisseurs particuliers.", readTime: '5 min' },
  { id: 2, title: 'fi-hub : notre vision du wealth tracking', cat: 'Produit', date: '12 Avr 2026', excerpt: "Pourquoi nous avons créé fi-hub et comment nous repensons le suivi patrimonial.", readTime: '4 min' },
  { id: 3, title: "Automatisation IA : par où commencer ?", cat: 'IA', date: '5 Avr 2026', excerpt: "Guide pratique pour identifier les premières opportunités d'automatisation.", readTime: '6 min' },
  { id: 4, title: "Les 5 erreurs à éviter dans votre stratégie digitale", cat: 'Stratégie', date: '28 Mar 2026', excerpt: "Retour d'expérience sur les pièges fréquents de la transformation digitale.", readTime: '3 min' },
]

type Post = typeof BLOG_POSTS[number]

function BlogCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#fff' : 'rgba(61,48,40,0.02)',
        border: `1px solid ${hovered ? 'rgba(61,48,40,0.1)' : 'rgba(61,48,40,0.06)'}`,
        borderRadius: 16, padding: 'clamp(24px, 3vw, 32px)',
        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: hovered ? '0 8px 32px rgba(61,48,40,0.06)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, fontWeight: 600, color: ACCENT, background: ACCENT + '12', padding: '3px 10px', borderRadius: 5 }}>{post.cat}</span>
        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.4)' }}>{post.date}</span>
        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.25)' }}>·</span>
        <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.4)' }}>{post.readTime}</span>
      </div>
      <h3 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 'clamp(18px, 2vw, 22px)', color: '#3d3028', marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
      <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(61,48,40,0.5)', lineHeight: 1.7 }}>{post.excerpt}</p>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, fontWeight: 600, color: ACCENT }}>
        Lire l&apos;article <span style={{ display: 'inline-block', transition: 'transform 0.3s', transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}>→</span>
      </span>
    </article>
  )
}

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState('Tous')
  const cats = ['Tous', 'IA', 'Produit', 'Stratégie']
  const filtered = selectedCat === 'Tous' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.cat === selectedCat)

  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: '80px clamp(24px, 5vw, 80px) 120px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Blog</span>
            <h1 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', color: '#3d3028', letterSpacing: '-0.03em', marginTop: 12 }}>Réflexions & insights</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {cats.map(c => (
              <button key={c} onClick={() => setSelectedCat(c)} style={{
                background: selectedCat === c ? ACCENT + '15' : 'rgba(61,48,40,0.04)',
                border: `1px solid ${selectedCat === c ? ACCENT + '30' : 'rgba(61,48,40,0.08)'}`,
                borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, fontWeight: 500,
                color: selectedCat === c ? ACCENT : 'rgba(61,48,40,0.55)', transition: 'all 0.3s',
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
