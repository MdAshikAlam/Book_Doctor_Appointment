"use client"

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import { Calendar, Phone, Stethoscope, Search, UserCheck, MessageSquare } from 'lucide-react';

const initialFollowUps = [
  { id: 1, name: 'David Smith', phone: '+91 99887 76655', lastVisit: '2026-06-24', diagnosis: 'Type 2 Diabetes', dueIn: '7 Days', notes: 'Review blood sugar log. Check HbA1c status.' },
  { id: 2, name: 'Siddharth Patel', phone: '+91 98765 43210', lastVisit: '2026-06-20', diagnosis: 'Acidity & Reflux', dueIn: '14 Days', notes: 'Check response to Pantoprazole 40mg.' },
  { id: 3, name: 'Amit Singh', phone: '+91 76543 21098', lastVisit: '2026-06-24', diagnosis: 'Essential Hypertension', dueIn: '30 Days', notes: 'Monitor BP weekly. Advised low salt diet.' }
];

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = followUps.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <p className="font-bold">No follow-ups found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-150 p-5 space-y-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><Phone size={10} /> {item.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-650 font-black text-[9px] uppercase tracking-wider">
                    Due: {item.dueIn}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Last Diagnosis</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1"><Stethoscope size={12} className="text-primary" /> {item.diagnosis}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Clinical Note</span>
                    <span className="font-semibold text-slate-600 leading-relaxed block">{item.notes}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 pt-1 border-t border-slate-50">
                  <span>Last Visit: {item.lastVisit}</span>
                  <button 
                    onClick={() => alert(`Sending follow-up reminder SMS to ${item.name}...`)}
                    className="text-primary hover:underline uppercase tracking-widest"
                  >
                    Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
