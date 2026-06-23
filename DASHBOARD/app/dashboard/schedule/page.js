"use client"

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import { CalendarDays, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SchedulePage() {
  const [clinicHours, setClinicHours] = useState('09:00 AM - 05:00 PM');
  const [slotDuration, setSlotDuration] = useState('15 min');
  const [vacationMode, setVacationMode] = useState(false);
  const [emergencyLeave, setEmergencyLeave] = useState(false);
  const [blockedDates, setBlockedDates] = useState(['2026-07-04', '2026-07-05']);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const [availableDays, setAvailableDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false
  });

  const handleDayToggle = (day) => {
    setAvailableDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleAddBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates(prev => [...prev, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const handleRemoveBlockedDate = (date) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calendar Settings</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Shift & Availability Planner</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Availability Shift Parameters */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Shift Rules & Slots" subtitle="Define default clinical hours and slot templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1.5">Default Clinic Hours</label>
                <select
                  value={clinicHours}
                  onChange={(e) => setClinicHours(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs"
                >
                  <option>09:00 AM - 05:00 PM</option>
                  <option>08:00 AM - 04:00 PM</option>
                  <option>10:00 AM - 06:00 PM</option>
                  <option>09:00 AM - 01:00 PM (Half Shift)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1.5">Consultation Slot Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs"
                >
                  <option>10 min</option>
                  <option>15 min</option>
                  <option>20 min</option>
                  <option>30 min</option>
                  <option>45 min</option>
                </select>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Active Practice Days</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.keys(availableDays).map(day => (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all text-center ${
                      availableDays[day]
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Blocked Dates */}
          <Card title="Calendar Exclusions & Blocked Dates" subtitle="Prevent patient bookings on specific holiday dates">
            <div className="flex gap-3 max-w-md">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs flex-1"
              />
              <button
                onClick={handleAddBlockedDate}
                className="h-11 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl"
              >
                Block Date
              </button>
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              {blockedDates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No dates blocked.</p>
              ) : (
                blockedDates.map(date => (
                  <span key={date} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 font-bold text-xs">
                    {date}
                    <button onClick={() => handleRemoveBlockedDate(date)} className="font-extrabold hover:text-rose-800">×</button>
                  </span>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Vacation & Emergency toggles */}
        <div className="space-y-6">
          <Card title="Control Exceptions" subtitle="Roster toggles">
            <div className="space-y-4">
              
              {/* Vacation Mode */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Vacation Mode</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle clinical practice off</p>
                </div>
                <button
                  onClick={() => setVacationMode(!vacationMode)}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${vacationMode ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${vacationMode ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Emergency Leave */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Emergency Leave</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cancel bookings for next 4 hours</p>
                </div>
                <button
                  onClick={() => {
                    setEmergencyLeave(!emergencyLeave);
                    if (!emergencyLeave) {
                      alert("Emergency Leave activated. Queue halted and patients notified.");
                    }
                  }}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${emergencyLeave ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${emergencyLeave ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
