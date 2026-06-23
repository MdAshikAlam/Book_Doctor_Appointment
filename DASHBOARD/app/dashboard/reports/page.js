"use client"

import React, { useState } from 'react';
import Card from '@/components/common/Card';
import { Flag, TrendingUp, Users, ClipboardList, FileCheck, Clock, Download } from 'lucide-react';
import Chart from '@/components/dashboard/Chart';

const consultationVolumeData = [
  { name: 'Mon', count: 8 },
  { name: 'Tue', count: 12 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 10 },
  { name: 'Fri', count: 18 },
  { name: 'Sat', count: 6 },
  { name: 'Sun', count: 2 }
];

export default function ReportsPage() {
  const [reportRange, setReportRange] = useState('Today');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Practice Metrics</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Clinical Reports & Insights</h1>
        </div>
        <div>
          <button 
            onClick={() => alert("Downloading full performance report...")}
            className="h-11 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Volume</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 divide-x">
            <div>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Today's Patients</p>
              <p className="text-xl font-black text-slate-800">18</p>
            </div>
            <div className="pl-4">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Patients</p>
              <p className="text-xl font-black text-slate-800">342</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consultations</span>
            <ClipboardList size={18} className="text-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 divide-x">
            <div>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Consultation Count</p>
              <p className="text-xl font-black text-slate-800">420</p>
            </div>
            <div className="pl-4">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Follow-Up Rate</p>
              <p className="text-xl font-black text-slate-800">15.4%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Care Stats</span>
            <FileCheck size={18} className="text-emerald-500" />
          </div>
          <div className="grid grid-cols-2 gap-4 divide-x">
            <div>
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Prescriptions</p>
              <p className="text-xl font-black text-slate-800">386</p>
            </div>
            <div className="pl-4">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Avg Duration</p>
              <p className="text-xl font-black text-slate-800">12 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card title="Consultation Flow History" subtitle="Weekly overview of completed clinical visits">
        <Chart type="line" data={consultationVolumeData} dataKey="count" color="#10b981" />
      </Card>

    </div>
  );
}
