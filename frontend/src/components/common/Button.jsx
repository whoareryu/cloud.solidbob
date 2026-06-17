import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'btn-primary',
  teal: 'btn-teal',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`${VARIANTS[variant] ?? VARIANTS.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}
