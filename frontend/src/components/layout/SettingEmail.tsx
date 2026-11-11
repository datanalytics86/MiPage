'use client'

import { siteConfig } from '@/lib/site'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export function SettingEmail({ kind }: { kind: 'contact' | 'support' | 'legal' | 'privacy' }) {
  const { data } = useSiteSettings()
  const email =
    kind === 'legal'
      ? data?.content.legalEmail || siteConfig.emails.legal
      : kind === 'privacy'
        ? data?.content.privacyEmail || siteConfig.emails.privacy
        : kind === 'support'
          ? data?.email.supportEmail || siteConfig.emails.support
          : data?.content.contactEmail || siteConfig.emails.contact

  return (
    <a href={`mailto:${email}`} className="text-gold hover:underline">
      {email}
    </a>
  )
}
