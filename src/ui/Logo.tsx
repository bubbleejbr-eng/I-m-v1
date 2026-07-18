import { Link } from 'react-router-dom'
import { brand } from '../content/brand'

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 font-heading text-xl font-semibold tracking-tight ${dark ? 'text-ivory' : 'text-navy'}`}
      aria-label={`${brand.productName} home`}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold text-gold"
        aria-hidden="true"
      >
        {/* Simple abstracted five-point star, evokes American motifs without a flag or seal */}
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 1.5l2.85 6.32 6.9.63-5.2 4.63 1.55 6.77L12 16.9l-6.1 2.95 1.55-6.77-5.2-4.63 6.9-.63L12 1.5z" />
        </svg>
      </span>
      <span>{brand.productNameShort}</span>
      <span className="hidden font-body text-sm font-normal opacity-70 sm:inline">American Immigration</span>
    </Link>
  )
}
