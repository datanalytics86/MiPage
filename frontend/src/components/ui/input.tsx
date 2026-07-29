import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-background-secondary px-4 py-2 text-sm font-body text-foreground',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-foreground-muted',
          'focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-gold/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
