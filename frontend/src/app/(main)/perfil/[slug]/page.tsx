import { ProviderProfileClient } from '@/components/providers/ProviderProfileClient'

interface ProviderPageProps {
  params: { slug: string }
}

export default function ProviderPage({ params }: ProviderPageProps) {
  return <ProviderProfileClient slug={params.slug} />
}