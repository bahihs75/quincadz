type GoogleMarkProps = {
  size?: number
  className?: string
}

export default function GoogleMark({ size = 20, className = '' }: GoogleMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
    >
      <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.45-.21-2.13H12v4.03h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.88-1.73 2.99-4.28 2.99-7.43Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.22-2.51c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.62-4.13H3.05v2.59A9.99 9.99 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.38 13.88A6 6 0 0 1 6.07 12c0-.65.11-1.28.31-1.88V7.53H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.47l3.33-2.59Z" />
      <path fill="#EA4335" d="M12 5.99c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 2.99 14.7 2 12 2a9.99 9.99 0 0 0-8.95 5.53l3.33 2.59C7.18 7.75 9.39 5.99 12 5.99Z" />
    </svg>
  )
}
