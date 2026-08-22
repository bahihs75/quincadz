'use client'

import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  onClick: () => void
  className?: string
  label?: string
}

export default function LogoutButton({ onClick, className = '', label = 'تسجيل الخروج' }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`icon-button group gap-2 px-3 ${className}`}
    >
      <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:max-w-24 group-focus-visible:opacity-100">
        {label}
      </span>
    </button>
  )
}
