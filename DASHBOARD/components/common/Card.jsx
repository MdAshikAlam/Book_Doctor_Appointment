import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = ({ children, className, title, subtitle, footer, action, noPadding }) => {
  return (
    <div className={cn("bg-card rounded-xl border border-border card-shadow flex flex-col", className)}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn("flex-1 p-6 overflow-visible", noPadding && "p-0")}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
