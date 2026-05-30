import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Container({ children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`global-container ${className}`} {...props}>
      {children}
    </div>
  );
}
