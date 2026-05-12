'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blog-posts'
import type { BlogPost } from '@/lib/blog-posts'

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="editorial-list-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '110px minmax(0, 1fr) 190px',
        gap: 32,
        padding: '34px 0',
        borderTop: '1px solid var(--ink-faint)',
        alignItems: 'baseline',
        position: 'relative',
        background: hovered ? 'rgba(217,119,6,0.04)' : 'transparent',
        transition: 'background 0.35s ease',
      }}
    >
      <span
        className="index-num"
        style={{
          fontSize: 'clamp(54px, 6vw, 84px)',
          fontStyle: hovered ? 'italic' : 'normal',
          transition: 'font-style 0.3s ease, transform 0.3s ease',
          transform: hovered ? 'translateX(6px)' : 'none',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <span className="eyebrow eyebrow-ember">{post.cat}</span>
          <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--ink-muted)' }}>
            {post.date} · {post.readTime}
          </span>
        </div>
        <h2
          className="display"
          style={{
            fontSize: 'clamp(30px, 4vw, 56px)',
            fontWeight: 600,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            marginBottom: 12,
          }}
        >
          {post.title}
        </h2>
        <p style={{ maxWidth: 720, color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.7 }}>
          {post.excerpt}
        </p>
      </div>

      <span
        className="mono"
        style={{
          justifySelf: 'end',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: hovered ? 'var(--ember-hot)' : 'var(--ink)',
          borderBottom: '1px solid currentColor',
          paddingBottom: 4,
          transition: 'color 0.3s ease',
        }}
      >
        Lire →
      </span>
    </Link>
  )
}

export default function BlogPage() {
  const [selectedCat, setSelectedCat] = useState('Tous')
  const cats = ['Tous', ...Array.from(new Set(BLOG_POSTS.map(post => post.cat)))]
  const filtered = selectedCat === 'Tous' ? BLOG_POSTS : BLOG_POSTS.filter(post => post.cat === selectedCat)

  return (
    <div style={{ paddingTop: 72 }}>
      <section style={{ padding: 'clamp(88px, 13vh, 150px) clamp(20px, 4vw, 56px) 54px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="eyebrow eyebrow-ember" style={{ marginBottom: 18 }}>
            Blog
          </div>
          <h1
            className="display"
            style={{
              fontSize: 'clamp(64px, 10vw, 148px)',
              fontWeight: 500,
              color: 'var(--ink)',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              maxWidth: 1040,
            }}
          >
            Notes sur les produits, l’IA et les interfaces.
          </h1>
          <p
            style={{
              marginTop: 32,
              maxWidth: 680,
              fontSize: 'clamp(17px, 1.6vw, 21px)',
              lineHeight: 1.7,
              color: 'var(--ink-soft)',
            }}
          >
            Des textes courts sur les décisions qui comptent quand on construit
            un produit digital : cadrage, usage, design, automatisation.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 clamp(20px, 4vw, 56px) clamp(88px, 12vh, 150px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 34 }}>
            {cats.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={selectedCat === cat ? 'btn-ember' : 'btn-ghost'}
                style={{ padding: '11px 16px', fontSize: 11 }}
              >
                {cat}
              </button>
            ))}
          </div>

          <hr className="rule-ember" />
          <div role="list">
            {filtered.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
          <hr className="rule" />
        </div>
      </section>
    </div>
  )
}

