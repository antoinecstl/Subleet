import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog-posts'

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }))
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
      <section className="article-hero-section" style={{ padding: 'clamp(76px, 12vh, 130px) clamp(20px, 4vw, 56px) 56px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <Link
            href="/blog"
            className="draw-link mono"
            style={{
              display: 'inline-block',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--ink-muted)',
              marginBottom: 46,
            }}
          >
            ← Retour au blog
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
            <span className="eyebrow eyebrow-ember">{post.cat}</span>
            <span className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--ink-muted)' }}>
              {post.date} · {post.readTime}
            </span>
          </div>

          <h1
            className="display article-hero-title"
            style={{
              fontSize: 'clamp(48px, 7.4vw, 104px)',
              fontWeight: 500,
              lineHeight: 0.94,
              color: 'var(--ink)',
              letterSpacing: '-0.04em',
              marginBottom: 34,
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontSize: 'clamp(18px, 1.8vw, 23px)',
              lineHeight: 1.65,
              color: 'var(--ink-soft)',
              borderLeft: '4px solid var(--ember)',
              paddingLeft: 24,
              maxWidth: 820,
            }}
          >
            {post.excerpt}
          </p>
        </div>
      </section>

      <article className="article-page-wrap" style={{ padding: '0 clamp(20px, 4vw, 56px) clamp(88px, 12vh, 150px)' }}>
        <div
          className="article-shell"
          style={{
            maxWidth: 860,
            margin: '0 auto',
            background: 'rgba(230,214,189,0.42)',
            borderTop: '1px solid var(--ink)',
            borderBottom: '1px solid var(--ink)',
            padding: 'clamp(36px, 5vw, 64px) 0',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(20px, 4vw, 42px)' }}>
            {post.content.map((section, index) => {
              if (section.type === 'intro') {
                return (
                  <p
                    key={index}
                    style={{
                      fontSize: 18,
                      lineHeight: 1.85,
                      color: 'var(--ink)',
                      marginBottom: 38,
                      fontWeight: 500,
                    }}
                  >
                    {section.text}
                  </p>
                )
              }

              if (section.type === 'h2') {
                return (
                  <h2
                    key={index}
                    className="display"
                    style={{
                      fontSize: 'clamp(32px, 4vw, 52px)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      letterSpacing: '-0.03em',
                      marginTop: 58,
                      marginBottom: 18,
                    }}
                  >
                    {section.text}
                  </h2>
                )
              }

              if (section.type === 'p') {
                return (
                  <p
                    key={index}
                    style={{
                      fontSize: 16,
                      lineHeight: 1.9,
                      color: 'var(--ink-soft)',
                      marginBottom: 26,
                    }}
                  >
                    {section.text}
                  </p>
                )
              }

              if (section.type === 'ul') {
                return (
                  <ul key={index} style={{ margin: '0 0 32px 0', paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 14 }}>
                    {section.items?.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '18px 1fr',
                          gap: 12,
                          alignItems: 'start',
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ember)', marginTop: 11 }} />
                        <span style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--ink-soft)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              }

              if (section.type === 'quote') {
                return (
                  <blockquote
                    key={index}
                    style={{
                      borderLeft: '4px solid var(--ember)',
                      padding: '8px 0 8px 24px',
                      margin: '42px 0',
                    }}
                  >
                    <p
                      className="display-italic"
                      style={{
                        fontSize: 'clamp(25px, 3vw, 36px)',
                        color: 'var(--ink)',
                        lineHeight: 1.2,
                        fontWeight: 400,
                      }}
                    >
                      {section.text}
                    </p>
                  </blockquote>
                )
              }

              return null
            })}

            <div
              className="article-bottom-cta"
              style={{
                marginTop: 68,
                paddingTop: 34,
                borderTop: '1px solid var(--ink-faint)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="eyebrow eyebrow-ember" style={{ marginBottom: 8 }}>
                  Subleet
                </div>
                <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                  Un projet produit, web ou IA à cadrer ?
                </p>
              </div>
              <Link href="/contact" className="btn-stamp">
                Nous contacter →
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
