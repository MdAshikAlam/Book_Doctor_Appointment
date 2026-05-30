import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export default function Section({ children, className = '', ...props }: SectionProps) {
  return (
    <section className={`global-section ${className}`} {...props}>
      {children}
    </section>
  );
}
