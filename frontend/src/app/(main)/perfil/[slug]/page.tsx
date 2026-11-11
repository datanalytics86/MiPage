import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProviderProfileClient } from '@/components/providers/ProviderProfileClient'
import { loadApprovedProvider } from '@/lib/publicProvider'
import { absoluteUrl } from '@/lib/site'

interface ProviderPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const { slug } = await params
  const provider = await loadApprovedProvider(slug)
  if (!provider) {
    return { title: 'Perfil no encontrado', robots: { index: false, follow: false } }
  }

  const title = `${provider.display_name} en ${provider.city}`
  const description = (provider.bio || `Aviso de ${provider.display_name} en ${provider.city}.`)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
  const image = provider.cover_photo || provider.photos?.[0]
  const url = absoluteUrl(`/perfil/${provider.slug}`)

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: 'es_CL',
      type: 'profile',
      images: image ? [{ url: image, alt: provider.display_name }] : undefined,
    },
  }
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = await params
  const provider = await loadApprovedProvider(slug)
  if (!provider) notFound()

  const image = provider.cover_photo || provider.photos?.[0]
  const mainEntity: Record<string, unknown> = {
    '@type': 'Person',
    name: provider.display_name,
    description: provider.bio || undefined,
    image: image || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.city,
      addressCountry: 'CL',
    },
  }
  if (provider.review_count > 0 && Number(provider.rating) > 0) {
    mainEntity.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(provider.rating),
      reviewCount: provider.review_count,
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: provider.display_name,
    url: absoluteUrl(`/perfil/${provider.slug}`),
    mainEntity,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProviderProfileClient slug={provider.slug} initial={provider} />
    </>
  )
}
