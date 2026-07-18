import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'outline' | 'outlineInverse' | 'ghost'
type Size = 'md' | 'lg' | 'sm'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-navy text-ivory hover:bg-navy-light',
  secondary: 'bg-brick text-ivory hover:bg-brick-light',
  outline: 'border-2 border-navy text-navy hover:bg-navy hover:text-ivory bg-transparent',
  // For use on dark backgrounds (e.g. the navy hero) — a separate
  // variant instead of overriding `outline` via className, since
  // conflicting Tailwind utilities (border-navy vs border-ivory) don't
  // reliably override by class order.
  outlineInverse: 'border-2 border-ivory text-ivory hover:bg-ivory hover:text-navy bg-transparent',
  ghost: 'text-navy hover:bg-navy/5 bg-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 min-h-11 disabled:opacity-50 disabled:cursor-not-allowed'

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
}

interface ButtonAsButton extends CommonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  to?: undefined
  href?: undefined
}

interface ButtonAsLink extends CommonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
  href?: undefined
}

interface ButtonAsAnchor extends CommonProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: undefined
  href: string
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const classes = clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)

    if ('to' in props && props.to) {
      const { to, ...rest } = props
      return (
        <Link ref={ref as never} to={to} className={classes} {...rest}>
          {children}
        </Link>
      )
    }

    if ('href' in props && props.href) {
      const { href, ...rest } = props
      return (
        <a ref={ref as never} href={href} className={classes} {...rest}>
          {children}
        </a>
      )
    }

    return (
      <button ref={ref as never} className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
