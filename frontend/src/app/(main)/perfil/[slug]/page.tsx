import { ProviderProfileClient } from '@/components/providers/ProviderProfileClient'
import { mockProviders } from '@/lib/mockProviders'

interface ProviderPageProps {
  params: { slug: string }
}

/** Pre-render demo slugs so profile links work even if SSR edge is slow. */
export function generateStaticParams() {
  return mockProviders.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = true

export default function ProviderPage({ params }: ProviderPageProps) {
  return <ProviderProfileClient slug={params.slug} />
}