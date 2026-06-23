"use client"

import React from 'react';
import Card from '@/components/common/Card';
import { History } from 'lucide-react';

export default function RecordsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical History</p>
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Electronic Medical Records</h1>
      
      <Card title="EMR Hub" subtitle="Secure patient historical timelines and clinical document uploads">
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
            <History size={28} />
          </div>
          <p className="font-extrabold text-sm text-slate-700">Unified Health Records Registry</p>
          <p className="text-xs text-slate-450 max-w-sm">Patient records, test results, and uploads can be accessed inside individual patient profiles from the Patients section.</p>
        </div>
      </Card>
    </div>
  );
}
