import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'fire' | 'lust';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    fire: 'bg-fire-500/20 text-fire-400 border border-fire-500/30',
    lust: 'bg-lust-500/20 text-lust-400 border border-lust-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'mr-1.5 h-2 w-2 rounded-full',
            variant === 'success' && 'bg-green-600',
            variant === 'warning' && 'bg-yellow-600',
            variant === 'danger' && 'bg-red-600',
            variant === 'info' && 'bg-blue-600',
            variant === 'fire' && 'bg-fire-500',
            variant === 'lust' && 'bg-lust-500',
            variant === 'default' && 'bg-gray-600'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
