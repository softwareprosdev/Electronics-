import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { blogPosts } from '@/lib/data/blog'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Technical Knowledge Center',
  description:
    'Technical articles on board repair, component-level electronics, GPUs, gaming consoles, automotive electronics, and diagnostics.',
  path: '/blog',
})

const categories = Array.from(new Set(blogPosts.map((post) => post.category)))

export default function BlogIndexPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Blog', path: '/blog' }]} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="eyebrow">Technical Knowledge Center</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
          Board Repair &amp; Electronics Engineering Articles
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-sm border border-lab-line px-3 py-1 text-xs text-lab-muted"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="panel flex flex-col justify-between p-6 hover:border-lab-accent/60"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-lab-accent">
                  {post.category}
                </span>
                <h2 className="mt-2 text-lg font-semibold text-lab-text">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-lab-muted">{post.excerpt}</p>
              </div>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-lab-accent2">
                Read Article
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
