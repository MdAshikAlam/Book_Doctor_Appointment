"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarWidget({ selectedDate, onDateSelect }) {
  const todayStr = getTodayDateString();
  
  // Initialize current view month based on selectedDate or today
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    return new Date();
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Starting day of the month (0 = Sunday)
  const startDay = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const days = [];
  // Empty blocks for offset days before start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = dateStr === selectedDate;
    const isToday = dateStr === todayStr;

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => onDateSelect(dateStr)}
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 active:scale-95' 
            : isToday 
              ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold active:scale-95' 
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-800">
            {monthNames[month]} {year}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition active:scale-95"
            title="Next Month"
          >
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider h-6 flex items-center justify-center">
            {d}
          </span>
        ))}
        {days}
      </div>
    </div>
  );
}

function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
