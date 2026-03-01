'use client'

import React from 'react'

interface LogoutButtonProps {
  onClick: () => void
  className?: string
}

export default function LogoutButton({ onClick, className }: LogoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`Btn ${className || ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '45px',
        height: '45px',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transitionDuration: '.3s',
        boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.199)',
        backgroundColor: 'rgb(255, 65, 65)',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget;
        btn.style.width = '125px';
        btn.style.borderRadius = '40px';
        const sign = btn.querySelector('.sign') as HTMLElement;
        if (sign) sign.style.width = '30%';
        const text = btn.querySelector('.text') as HTMLElement;
        if (text) {
          text.style.opacity = '1';
          text.style.width = '70%';
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget;
        btn.style.width = '45px';
        btn.style.borderRadius = '50%';
        const sign = btn.querySelector('.sign') as HTMLElement;
        if (sign) sign.style.width = '100%';
        const text = btn.querySelector('.text') as HTMLElement;
        if (text) {
          text.style.opacity = '0';
          text.style.width = '0%';
        }
      }}
    >
      <div className="sign" style={{ width: '100%', transitionDuration: '.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 512 512" width="17" height="17">
          <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" fill="white" />
        </svg>
      </div>
      <div className="text" style={{ position: 'absolute', right: '0%', width: '0%', opacity: 0, color: 'white', fontSize: '1.2em', fontWeight: 600, transitionDuration: '.3s' }}>Logout</div>
    </button>
  )
}
