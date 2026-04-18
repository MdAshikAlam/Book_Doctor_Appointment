import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DashboardCard = ({ title, value, icon: Icon, growth, isIncrease, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border card-shadow flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        
        {growth && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-lg",
              isIncrease ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
            )}>
              {isIncrease ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {growth}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
          </div>
        )}
      </div>

      <div className={cn("p-3 rounded-xl", colorMap[color] || colorMap.blue)}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default DashboardCard;
