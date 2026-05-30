import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btn-primary-custom' : 'btn-secondary-custom';
  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
