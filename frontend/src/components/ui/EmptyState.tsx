'use client'

import Link from 'next/link'
import { type LucideIcon, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-16 md:py-24',
        className
      )}
      role="status"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl glass shadow-soft">
        <Icon className="h-7 w-7 text-gold" aria-hidden />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-foreground-secondary max-w-md mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {children}
      {(actionLabel && actionHref) ||
      (actionLabel && onAction) ||
      (secondaryActionLabel && secondaryActionHref) ? (
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionLabel && actionHref ? (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : actionLabel && onAction ? (
            <Button type="button" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          {secondaryActionLabel && secondaryActionHref ? (
            <Button variant="outline" asChild>
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
