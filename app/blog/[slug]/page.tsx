import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog-posts'
import { ACCENT } from '@/lib/theme'

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  const url = `https://subleet.com/blog/${post.slug}`
  return {
    title: post.title,
    description: post.excerpt,

    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      siteName: 'Subleet',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Header */}
      <section style={{ padding: '72px clamp(20px, 5vw, 80px) 0', maxWidth: 760, margin: '0 auto' }}>
        <Link href="/blog" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'rgba(61,48,40,0.5)',
          textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s',
        }}>
          ← Retour au blog
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, fontWeight: 600, color: ACCENT, background: ACCENT + '15', padding: '4px 12px', borderRadius: 6 }}>{post.cat}</span>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.45)' }}>{post.date}</span>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.25)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'rgba(61,48,40,0.45)' }}>{post.readTime} de lecture</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 800,
          fontSize: 'clamp(26px, 4vw, 44px)', lineHeight: 1.15, color: '#3d3028',
          letterSpacing: '-0.025em', marginBottom: 24,
        }}>{post.title}</h1>

        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 18, lineHeight: 1.75,
          color: 'rgba(61,48,40,0.65)', borderLeft: `3px solid ${ACCENT}`,
          paddingLeft: 20, marginBottom: 56,
        }}>{post.excerpt}</p>
      </section>

      {/* Article body */}
      <article style={{ padding: '0 clamp(20px, 5vw, 80px) 120px', maxWidth: 760, margin: '0 auto' }}>
        {post.content.map((section, i) => {
          if (section.type === 'intro') {
            return (
              <p key={i} style={{
                fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 17, lineHeight: 1.85,
                color: 'rgba(61,48,40,0.75)', marginBottom: 36, fontWeight: 500,
              }}>{section.text}</p>
            )
          }
          if (section.type === 'h2') {
            return (
              <h2 key={i} style={{
                fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700,
                fontSize: 'clamp(20px, 2.5vw, 26px)', color: '#3d3028',
                letterSpacing: '-0.02em', marginTop: 52, marginBottom: 16, lineHeight: 1.3,
              }}>{section.text}</h2>
            )
          }
          if (section.type === 'p') {
            return (
              <p key={i} style={{
                fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, lineHeight: 1.85,
                color: 'rgba(61,48,40,0.7)', marginBottom: 24,
              }}>{section.text}</p>
            )
          }
          if (section.type === 'ul') {
            return (
              <ul key={i} style={{ margin: '0 0 28px 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {section.items?.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, marginTop: 9, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 16, lineHeight: 1.75, color: 'rgba(61,48,40,0.7)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            )
          }
          if (section.type === 'quote') {
            return (
              <blockquote key={i} style={{
                background: `${ACCENT}08`, border: `1px solid ${ACCENT}20`,
                borderLeft: `4px solid ${ACCENT}`, borderRadius: '0 12px 12px 0',
                padding: '20px 24px', margin: '36px 0',
              }}>
                <p style={{
                  fontFamily: 'var(--font-poppins), sans-serif', fontSize: 17, fontWeight: 600,
                  color: '#3d3028', lineHeight: 1.6, fontStyle: 'italic', margin: 0,
                }}>{section.text}</p>
              </blockquote>
            )
          }
          return null
        })}

        {/* CTA footer */}
        <div style={{
          marginTop: 64, padding: 40, background: '#2c2218', borderRadius: 20,
          border: '1px solid rgba(240,235,228,0.06)', textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'var(--font-poppins), sans-serif', fontWeight: 700, fontSize: 22, color: '#f0ebe4', marginBottom: 12 }}>
            Un projet en tête ?
          </h3>
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 15, color: 'rgba(240,235,228,0.55)', marginBottom: 28 }}>
            Discutons de votre situation et de la façon dont nous pouvons vous aider.
          </p>
          <Link href="/contact" style={{
            background: ACCENT, borderRadius: 10, padding: '12px 28px',
            color: '#fff', fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block',
          }}>Nous contacter →</Link>
        </div>
      </article>
    </div>
  )
}
