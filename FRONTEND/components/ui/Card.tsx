import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`global-card bg-white border border-slate-100 shadow-md shadow-slate-100/50 hover:shadow-xl transition-all duration-350 ${className}`} {...props}>
      {children}
    </div>
  );
}
