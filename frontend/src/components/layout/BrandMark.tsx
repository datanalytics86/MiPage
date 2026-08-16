import { cn } from '@/lib/utils'

/**
 * Portrait page with a gold dog-ear.
 * Reads as "Page" without saying it. Not a square app glyph.
 */
export function BrandMark({
  className,
  wordmark = true,
}: {
  className?: string
  wordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        className="brand-mark h-[22px] w-[17px] shrink-0 text-foreground"
        viewBox="0 0 20 26"
        fill="none"
        aria-hidden
      >
        <path
          d="M2.4 1.6h10.1L17.6 6.7v17.7H2.4V1.6Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 1.6v5.1h5.1"
          className="text-gold"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      {wordmark ? (
        <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground leading-none">
          Mi<span className="text-gold">Page</span>
        </span>
      ) : null}
    </span>
  )
}
