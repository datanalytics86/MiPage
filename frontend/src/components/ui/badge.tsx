import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gold/15 text-gold-light',
        gold: 'bg-gold text-[#0A0A0B] font-semibold',
        secondary: 'bg-muted text-foreground-secondary',
        success: 'bg-sage/15 text-sage-light',
        warning: 'bg-warning/15 text-warning',
        destructive: 'bg-error/15 text-error',
        outline: 'border border-border text-foreground-secondary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
