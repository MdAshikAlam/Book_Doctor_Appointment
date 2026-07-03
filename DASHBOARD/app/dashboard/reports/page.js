"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/common/Card';
import { Flag, TrendingUp, Users, ClipboardList, FileCheck, Clock, Download, Loader2 } from 'lucide-react';
import Chart from '@/components/dashboard/Chart';
import { appointmentsApi } from '@/lib/api';

export default function ReportsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.getMy();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointments for reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Calculations for real data
  const now = new Date();
  const todayStr = now.toDateString();

  // 1. Patient Volume
  const todayPatients = appointments.filter(
    a => new Date(a.date).toDateString() === todayStr && a.status !== 'cancelled'
  ).length;

  const monthlyPatients = appointments.filter(
    a => {
      const d = new Date(a.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && a.status !== 'cancelled';
    }
  ).length;

  // 2. Consultations
  const consultations = appointments.filter(
    a => ['completed', 'visited', 'follow_up'].includes(a.status?.toLowerCase())
  );
  const consultationCount = consultations.length;

  const followUps = appointments.filter(
    a => a.status?.toLowerCase() === 'follow_up'
  );
  const followUpRate = consultationCount > 0 
    ? ((followUps.length / consultationCount) * 100).toFixed(1) + '%' 
    : '0.0%';

  // 3. Care Stats
  const prescriptionsCount = appointments.reduce(
    (sum, a) => sum + (a.prescriptions ? a.prescriptions.length : 0), 
    0
  );

  // Avg Duration based on consultation timestamps (fallback to 12 if no data available)
  const completedWithTimes = appointments.filter(a => a.consultationStartedAt && a.consultationCompletedAt);
  let avgDuration = 12;
  if (completedWithTimes.length > 0) {
    const totalMin = completedWithTimes.reduce((sum, a) => {
      const start = new Date(a.consultationStartedAt);
      const end = new Date(a.consultationCompletedAt);
      const diffMs = end.getTime() - start.getTime();
      return sum + Math.max(0, Math.floor(diffMs / 60000));
    }, 0);
    avgDuration = Math.round(totalMin / completedWithTimes.length);
  }

  // 4. Consultation Flow History (Last 7 Days)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const consultationVolumeData = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    consultationVolumeData.push({
      name: weekdays[d.getDay()],
      dateStr: d.toDateString(),
      count: 0
    });
  }

  appointments.forEach(a => {
    if (['completed', 'visited', 'follow_up'].includes(a.status?.toLowerCase())) {
      const dateStr = new Date(a.date).toDateString();
      const dayObj = consultationVolumeData.find(c => c.dateStr === dateStr);
      if (dayObj) {
        dayObj.count++;
      }
    }
  });

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

      {loading ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-400 mt-4 font-bold">Generating report insights...</p>
        </div>
      ) : (
        <>
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
                  <p className="text-xl font-black text-slate-800">{todayPatients}</p>
                </div>
                <div className="pl-4">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Patients</p>
                  <p className="text-xl font-black text-slate-800">{monthlyPatients}</p>
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
                  <p className="text-xl font-black text-slate-800">{consultationCount}</p>
                </div>
                <div className="pl-4">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Follow-Up Rate</p>
                  <p className="text-xl font-black text-slate-800">{followUpRate}</p>
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
                  <p className="text-xl font-black text-slate-800">{prescriptionsCount}</p>
                </div>
                <div className="pl-4">
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Avg Duration</p>
                  <p className="text-xl font-black text-slate-800">{avgDuration} min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <Card title="Consultation Flow History" subtitle="Weekly overview of completed clinical visits">
            <Chart type="line" data={consultationVolumeData} dataKey="count" color="#10b981" />
          </Card>
        </>
      )}

    </div>
  );
}
