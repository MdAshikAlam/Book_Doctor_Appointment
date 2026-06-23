"use client"

import React from 'react';
import Card from '@/components/common/Card';
import { ClipboardList } from 'lucide-react';

export default function ConsultationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Registry</p>
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Consultations</h1>
      
      <Card title="Consultation Registry" subtitle="Historical and active patient diagnostic records">
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
            <ClipboardList size={28} />
          </div>
          <p className="font-extrabold text-sm text-slate-700">No active external consultations</p>
          <p className="text-xs text-slate-450 max-w-sm">Use the dashboard visit queue to launch and record diagnosis notes for checked-in patients.</p>
        </div>
      </Card>
    </div>
  );
}
