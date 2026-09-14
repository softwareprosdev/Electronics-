import type { MetadataRoute } from 'next'
import { services } from '@/lib/data/services'
import { locations } from '@/lib/data/locations'
import { blogPosts } from '@/lib/data/blog'
import { siteConfig } from '@/lib/site-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/mail-in-repair',
    '/business-services',
    '/repair-shop-partner-program',
    '/contact',
    '/faq',
    '/blog',
    '/request-repair',
    '/portal',
    '/privacy',
    '/terms',
    '/repair-policy',
  ]

  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.6,
  }))

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${siteConfig.url}/${service.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const locationEntries: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${siteConfig.url}/service-area/${location.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.5,
  }))

  return [...staticEntries, ...serviceEntries, ...locationEntries, ...blogEntries]
}
