"use client"

import React from 'react';
import Card from '@/components/common/Card';
import { Video } from 'lucide-react';

export default function VideoConsultsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telehealth Center</p>
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Video Consultations</h1>
      
      <Card title="Secure Telehealth Lounge" subtitle="Encrypted audio-visual calls and remote appointments">
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
            <Video size={28} />
          </div>
          <p className="font-extrabold text-sm text-slate-700">No scheduled video sessions</p>
          <p className="text-xs text-slate-450 max-w-sm">Launch direct telehealth consultations with patients on the queue using telehealth appointment types.</p>
        </div>
      </Card>
    </div>
  );
}
