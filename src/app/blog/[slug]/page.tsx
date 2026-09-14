import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CtaSection } from '@/components/CtaSection'
import { blogPosts, getBlogPostBySlug } from '@/lib/data/blog'
import { buildMetadata } from '@/lib/seo'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return {}

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  })
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-wide text-lab-accent">
          {post.category}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
          {post.title}
        </h1>
        <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm leading-relaxed text-lab-muted sm:text-base">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/blog" className="btn-tertiary">
            &larr; Back to Technical Knowledge Center
          </Link>
        </div>
      </article>

      <CtaSection headline="Have a similar failure? Request a diagnostic." />
    </>
  )
}
