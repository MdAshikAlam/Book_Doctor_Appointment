import React from 'react';

interface SectionHeaderProps {
  badge?: string | React.ReactNode;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export default function SectionHeader({
  badge,
  title,
  description,
  className = '',
  align = 'center',
}: SectionHeaderProps) {
  const alignmentClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  const mxClass = align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';

  return (
    <div className={`flex flex-col ${alignmentClass} ${mxClass} max-w-3xl mb-12 ${className}`}>
      {badge && (
        <div className="mb-4"> {/* 16px gap */}
          {typeof badge === 'string' ? (
            <span className="px-4 py-1.5 rounded-full bg-[#0E7C66]/10 text-[#0E7C66] text-xs font-bold uppercase tracking-wider">
              {badge}
            </span>
          ) : (
            badge
          )}
        </div>
      )}
      <h2 className="font-h2 text-slate-900 mb-5">{title}</h2> {/* 20px gap */}
      {description && (
        <p className={`font-body-primary text-slate-500 font-medium ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
}
