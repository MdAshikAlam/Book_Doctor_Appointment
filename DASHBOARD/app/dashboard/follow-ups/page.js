"use client"

import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import { Calendar, Phone, Stethoscope, Search, UserCheck, MessageSquare, Loader2 } from 'lucide-react';
import { appointmentsApi } from '@/lib/api';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await appointmentsApi.getMy();
      const appointments = res.data.appointments || [];
      
      // Filter appointments/patients that are follow-ups
      // These are records where status is 'follow_up' OR followUp date is set.
      const filteredFollowUps = appointments.filter(item => 
        item.status === 'follow_up' || (item.followUp && item.followUp.date)
      );

      setFollowUps(filteredFollowUps);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
      setError(err.message || 'Failed to load follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const getDueInString = (dueDateStr) => {
    if (!dueDateStr) return 'N/A';
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1) return `In ${diffDays} Days`;
    return `${Math.abs(diffDays)} Days Ago`;
  };

  const filtered = followUps.filter(f => {
    const name = f.name || f.fullName || '';
    const diagnosis = f.diagnosis || f.reason || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Title */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Care Continuum</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Follow-Up Management</h1>
        </div>
        <div className="relative group max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name/diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white transition-all outline-none w-64"
          />
        </div>
      </div>

      {/* Follow-ups List */}
      <Card title="Scheduled Follow-Ups" subtitle="Patients due for medical review and continuous monitoring">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
            <p className="font-bold">Loading follow-ups...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center text-red-500">
            <p className="font-bold">{error}</p>
            <button 
              onClick={fetchFollowUps}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <p className="font-bold">No follow-ups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => {
              const name = item.name || item.fullName || 'Unknown Patient';
              const phone = item.phone || 'N/A';
              const diagnosis = item.diagnosis || item.reason || 'N/A';
              const notes = item.notes || item.followUp?.notes || 'No follow-up notes provided.';
              const lastVisit = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';
              const dueIn = item.followUp?.date ? getDueInString(item.followUp.date) : 'N/A';

              return (
                <div key={item._id || item.id} className="bg-white rounded-2xl border border-slate-150 p-5 space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{name}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><Phone size={10} /> {phone}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-650 font-black text-[9px] uppercase tracking-wider">
                      Due: {dueIn}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Last Diagnosis</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1"><Stethoscope size={12} className="text-primary" /> {diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Clinical Note</span>
                      <span className="font-semibold text-slate-600 leading-relaxed block">{notes}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black text-slate-400 pt-1 border-t border-slate-50">
                    <span>Last Visit: {lastVisit}</span>
                    <button 
                      onClick={() => alert(`Sending follow-up reminder SMS to ${name}...`)}
                      className="text-primary hover:underline uppercase tracking-widest"
                    >
                      Send Reminder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}
