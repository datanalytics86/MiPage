import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'fire' | 'lust' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800 hover:scale-105 active:scale-95',
      secondary:
        'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 active:bg-secondary-800 hover:scale-105 active:scale-95',
      outline:
        'border-2 border-fire-500 text-fire-500 hover:bg-fire-500 hover:text-white focus:ring-fire-500 active:bg-fire-600',
      ghost:
        'text-warm-200 hover:bg-dark-800 focus:ring-dark-600 active:bg-dark-700',
      danger:
        'bg-lust-600 text-white hover:bg-lust-700 focus:ring-lust-500 active:bg-lust-800 shadow-lust hover:shadow-lust-lg hover:scale-105 active:scale-95',
      fire:
        'bg-gradient-to-r from-fire-500 to-fire-600 text-white hover:from-fire-600 hover:to-fire-700 focus:ring-fire-500 active:from-fire-700 active:to-fire-800 shadow-fire hover:shadow-fire-lg hover:scale-105 active:scale-95',
      lust:
        'bg-gradient-to-r from-lust-500 to-lust-700 text-white hover:from-lust-600 hover:to-lust-800 focus:ring-lust-500 active:from-lust-700 active:to-lust-900 shadow-lust hover:shadow-lust-lg hover:scale-105 active:scale-95',
      dark:
        'bg-dark-850 text-warm-50 border border-dark-700 hover:bg-dark-800 hover:border-dark-600 focus:ring-dark-600 active:bg-dark-900 shadow-dark',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
