import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';
import { buildButtonClasses, ButtonSize, ButtonVariant } from './Button';

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export interface ButtonLinkProps
  extends Omit<AnchorProps, 'href'>,
    Omit<LinkProps, 'href' | 'as' | 'passHref'> {
  href: LinkProps['href'];
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    {
      href,
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className,
      prefetch,
      ...rest
    },
    ref
  ) => (
    <Link
      href={href}
      prefetch={prefetch}
      className={buildButtonClasses({ variant, size, fullWidth, className })}
      ref={ref}
      {...rest}
    >
      {children}
    </Link>
  )
);

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
