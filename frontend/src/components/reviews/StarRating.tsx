'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

const sizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}

const gaps = {
  xs: 'gap-0.5',
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1',
  xl: 'gap-1.5',
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

export function StarRating({
  rating,
  size = 'sm',
  interactive = false,
  onRatingChange,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const displayRating = interactive ? (hoverRating || rating) : rating

  const handleClick = (star: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(star)
    }
  }

  const handleMouseEnter = (star: number) => {
    if (interactive) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  return (
    <div className={cn('flex items-center', gaps[size], className)}>
      <div className={cn('flex items-center', gaps[size])}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = displayRating >= star
          const isHalfFilled = !isFilled && displayRating >= star - 0.5

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-gold/50 rounded',
                !interactive && 'cursor-default'
              )}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  sizes[size],
                  'transition-colors',
                  isFilled
                    ? 'text-gold fill-gold'
                    : 'text-muted'
                )}
              />
              {/* Half star overlay */}
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star
                    className={cn(sizes[size], 'text-gold fill-gold')}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className={cn('text-foreground-secondary ml-1', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Compact version for inline use
export function StarRatingCompact({
  rating,
  reviewCount,
  size = 'sm',
}: {
  rating: number
  reviewCount?: number
  size?: 'xs' | 'sm' | 'md'
}) {
  return (
    <div className={cn('flex items-center', gaps[size])}>
      <Star className={cn(sizes[size], 'text-gold fill-gold')} />
      <span className={cn('font-medium text-foreground', textSizes[size])}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={cn('text-foreground-muted', textSizes[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
