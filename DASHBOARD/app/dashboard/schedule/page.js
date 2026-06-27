"use client"

import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import { CalendarDays, Clock, ShieldAlert, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { doctorsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SchedulePage() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [clinicHours, setClinicHours] = useState('09:00 AM - 05:00 PM');
  const [slotDuration, setSlotDuration] = useState('15 min');
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('Personal Leave');

  const [availableDays, setAvailableDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await doctorsApi.getMe();
      const doc = res.data.doctor;
      setDoctorProfile(doc);
      
      // Load availability
      if (doc.availability && doc.availability.length > 0) {
        const daysObj = {
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false
        };
        doc.availability.forEach(a => {
          if (daysObj.hasOwnProperty(a.day)) {
            daysObj[a.day] = a.slots?.length > 0;
          }
        });
        setAvailableDays(daysObj);
        
        // Deduce slot duration from first slot
        const firstDayWithSlots = doc.availability.find(a => a.slots && a.slots.length > 0);
        if (firstDayWithSlots && firstDayWithSlots.slots[0]) {
          const parts = firstDayWithSlots.slots[0].split(' - ');
          if (parts[0] && parts[1]) {
            const parseTime = (t) => {
              const [h, m] = t.split(':').map(Number);
              return h * 60 + m;
            };
            const diff = parseTime(parts[1]) - parseTime(parts[0]);
            setSlotDuration(`${diff} min`);
          }
        }
      }

      // Load leaves (include reasons)
      if (doc.leaves && doc.leaves.length > 0) {
        const dates = doc.leaves.map(l => ({
          id: l._id,
          date: new Date(l.startDate).toISOString().split('T')[0],
          reason: l.reason || 'Personal Leave'
        }));
        setBlockedDates(dates);
      } else {
        setBlockedDates([]);
      }
    } catch (err) {
      console.error("Failed to load doctor profile for schedule", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDayToggle = (day) => {
    if (!isEditing) return;
    setAvailableDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restore settings from loaded profile
    if (doctorProfile) {
      if (doctorProfile.availability && doctorProfile.availability.length > 0) {
        const daysObj = {
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false
        };
        doctorProfile.availability.forEach(a => {
          if (daysObj.hasOwnProperty(a.day)) {
            daysObj[a.day] = a.slots?.length > 0;
          }
        });
        setAvailableDays(daysObj);
        
        const firstDayWithSlots = doctorProfile.availability.find(a => a.slots && a.slots.length > 0);
        if (firstDayWithSlots && firstDayWithSlots.slots[0]) {
          const parts = firstDayWithSlots.slots[0].split(' - ');
          if (parts[0] && parts[1]) {
            const parseTime = (t) => {
              const [h, m] = t.split(':').map(Number);
              return h * 60 + m;
            };
            const diff = parseTime(parts[1]) - parseTime(parts[0]);
            setSlotDuration(`${diff} min`);
          }
        }
      }
    }
  };

  const handleApplyShiftRules = async () => {
    if (!doctorProfile) {
      alert("No doctor profile loaded");
      return;
    }
    
    try {
      setSaving(true);
      
      const convertTo24 = (timeStr) => {
        const matches = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!matches) return '09:00';
        let hours = parseInt(matches[1], 10);
        const minutes = matches[2];
        const ampm = matches[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      };

      const hoursParts = clinicHours.split(' - ');
      const startTime = convertTo24(hoursParts[0] || '09:00 AM');
      const endTime = convertTo24(hoursParts[1] || '05:00 PM');
      const duration = parseInt(slotDuration) || 15;
      const days = Object.keys(availableDays).filter(d => availableDays[d]);
      
      if (days.length === 0) {
        alert("Please select at least one active practice day.");
        setSaving(false);
        return;
      }

      await doctorsApi.generateAvailability(doctorProfile._id, {
        days,
        startTime,
        endTime,
        duration
      });

      alert("Shift and availability settings updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      alert("Failed to update availability: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate) return;
    
    if (blockedDates.some(b => b.date === newBlockedDate)) {
      alert("This date is already blocked or on leave.");
      return;
    }

    try {
      if (doctorProfile) {
        await doctorsApi.addLeave(doctorProfile._id, {
          startDate: newBlockedDate,
          endDate: newBlockedDate,
          reason: leaveReason || 'Personal Leave'
        });
      }
      setNewBlockedDate('');
      setLeaveReason('Personal Leave');
      alert("Leave applied successfully!");
      fetchProfile();
    } catch (err) {
      alert("Failed to apply leave: " + err.message);
    }
  };

  const handleRemoveBlockedDate = async (date) => {
    try {
      if (doctorProfile) {
        const updatedLeaves = doctorProfile.leaves?.filter(l => new Date(l.startDate).toISOString().split('T')[0] !== date) || [];
        await doctorsApi.update(doctorProfile._id, {
          leaves: updatedLeaves
        });
        alert("Blocked date removed successfully!");
        fetchProfile();
      }
    } catch (err) {
      alert("Failed to remove blocked date: " + err.message);
    }
  };

  const isReadOnlyLeave = (reason) => {
    const r = reason.toLowerCase();
    return r.includes('holiday') || r.includes('admin') || r.includes('clinic closure');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
        <p className="text-slate-450 mt-4 font-bold text-xs uppercase tracking-wider">Loading Schedule Planner...</p>
      </div>
    );
  }

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

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Core Availability Shift Parameters */}
        <Card 
            title="Shift Rules & Slots" 
            subtitle="Define default clinical hours and slot templates"
            action={
              !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                >
                  Edit Settings
                </button>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-1.5">Default Clinic Hours</label>
                <select
                  value={clinicHours}
                  disabled={!isEditing}
                  onChange={(e) => setClinicHours(e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs transition-all ${
                    !isEditing ? 'opacity-70 bg-slate-100/80 cursor-default border-slate-200' : 'cursor-pointer focus:border-blue-600'
                  }`}
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
                  disabled={!isEditing}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs transition-all ${
                    !isEditing ? 'opacity-70 bg-slate-100/80 cursor-default border-slate-200' : 'cursor-pointer focus:border-blue-600'
                  }`}
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
                    } ${!isEditing ? 'cursor-default opacity-85' : 'hover:scale-[1.02] cursor-pointer'}`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="h-11 px-5 border border-slate-200 hover:bg-slate-55 text-slate-600 hover:text-slate-800 font-extrabold text-xs rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyShiftRules}
                  disabled={saving}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            )}
          </Card>

          {/* Blocked Dates (Personal Leaves) */}
          <Card 
            title="Personal Leaves & Absences" 
            subtitle="Manage your personal leave days. Holiday closures are managed by clinic administration."
          >
            <div className="flex flex-col md:flex-row gap-3 max-w-xl">
              <input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs flex-1"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Medical, Vacation)"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="h-11 px-4 rounded-xl bg-slate-50 border outline-none font-bold text-xs flex-[1.5]"
              />
              <button
                onClick={handleAddBlockedDate}
                className="h-11 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl transition-all whitespace-nowrap"
              >
                Apply Leave
              </button>
            </div>

            <div className="pt-4 flex flex-col gap-2.5">
              {blockedDates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No leaves or exclusions recorded.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {blockedDates.map(item => {
                    const isReadOnly = isReadOnlyLeave(item.reason);
                    return (
                      <div 
                        key={item.id || item.date} 
                        className={`flex items-center justify-between p-3.5 rounded-2xl border font-bold text-xs transition-all ${
                          isReadOnly 
                            ? 'bg-slate-50 border-slate-200 text-slate-500' 
                            : 'bg-rose-50/50 border-rose-100 text-rose-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-black">{item.date}</p>
                          <p className={`text-[10px] font-semibold capitalize ${isReadOnly ? 'text-slate-400' : 'text-rose-500'}`}>
                            {isReadOnly ? 'Holiday (Admin Assigned)' : item.reason}
                          </p>
                        </div>
                        {!isReadOnly && (
                          <button 
                            onClick={() => handleRemoveBlockedDate(item.date)} 
                            className="w-6 h-6 rounded-lg bg-white border border-rose-200 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all font-black text-xs"
                            title="Remove Leave"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
      </div>

    </div>
  );
}
