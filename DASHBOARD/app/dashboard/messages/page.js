"use client"

import React from 'react';
import Card from '@/components/common/Card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbox</p>
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Messaging</h1>
      
      <Card title="Messages & Team Chats" subtitle="Secure messaging between patients, doctors, and staff">
        <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-350">
            <MessageSquare size={28} />
          </div>
          <p className="font-extrabold text-sm text-slate-700">Inbox is empty</p>
          <p className="text-xs text-slate-450 max-w-sm">No new secure chat threads from patients or staff members have been received.</p>
        </div>
      </Card>
    </div>
  );
}
