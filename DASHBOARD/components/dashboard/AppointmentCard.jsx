import React from 'react';
import { Calendar, Clock, User, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AppointmentCard = ({ patientName, doctorName, time, status, date }) => {
  const statusStyles = {
    Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Pending: 'bg-orange-50 text-orange-600 border-orange-100',
    Cancelled: 'bg-red-50 text-red-600 border-red-100',
  };

  const statusIcons = {
    Confirmed: <CheckCircle2 size={14} />,
    Pending: <Clock3 size={14} />,
    Cancelled: <XCircle size={14} />,
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-border group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
          {patientName?.split(' ').map(n => n[0]).join('') || '?'}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{patientName || 'Unknown Patient'}</h4>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <User size={12} /> {doctorName}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 text-right">
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {time}</span>
        </div>
        <span className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
          statusStyles[status]
        )}>
          {statusIcons[status]}
          {status}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;
