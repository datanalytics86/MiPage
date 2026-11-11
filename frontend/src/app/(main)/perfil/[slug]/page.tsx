import { ProviderProfileClient } from '@/components/providers/ProviderProfileClient'
import { mockProviders } from '@/lib/mockProviders'

interface ProviderPageProps {
  params: Promise<{ slug: string }>
}

/** Pre-render demo slugs so profile links work even if SSR edge is slow. */
export function generateStaticParams() {
  return mockProviders.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = true

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = await params
  return <ProviderProfileClient slug={slug} />
}