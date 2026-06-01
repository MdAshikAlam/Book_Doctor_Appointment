"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Stethoscope, 
  IndianRupee, 
  Filter, 
  Download, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import Card from '@/components/common/Card';
import Chart from '@/components/dashboard/Chart';
import Table from '@/components/dashboard/Table';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export default function AnalyticsPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('patient'); // 'patient', 'clinic', 'doctor', 'revenue'
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'

  // MOCK DATA for analytics visuals
  const patientFunnelData = [
    { name: 'Booked', count: 1200 },
    { name: 'Confirmed', count: 980 },
    { name: 'Completed', count: 820 },
    { name: 'Cancelled', count: 110 },
    { name: 'No Show', count: 70 }
  ];

  const patientGrowthData = [
    { name: 'Jan', count: 400 },
    { name: 'Feb', count: 580 },
    { name: 'Mar', count: 720 },
    { name: 'Apr', count: 980 },
    { name: 'May', count: 1150 },
    { name: 'Jun', count: 1420 }
  ];

  const topClinicsAppointments = [
    { name: 'City Dental Clinic', appointments: 340, rating: 4.9, retention: '88%' },
    { name: 'Metro Heart Care', appointments: 290, rating: 4.8, retention: '85%' },
    { name: 'Green Life MultiSpeciality', appointments: 260, rating: 4.7, retention: '82%' },
    { name: 'Skin & Laser Center', appointments: 210, rating: 4.9, retention: '90%' },
    { name: 'Apex Eye Clinic', appointments: 190, rating: 4.6, retention: '79%' }
  ];

  const topClinicsRevenue = [
    { name: 'Metro Heart Care', revenue: 145000, appointments: 290 },
    { name: 'City Dental Clinic', revenue: 112000, appointments: 340 },
    { name: 'Green Life MultiSpeciality', revenue: 98000, appointments: 260 },
    { name: 'Skin & Laser Center', revenue: 84000, appointments: 210 },
    { name: 'Apex Eye Clinic', revenue: 56000, appointments: 190 }
  ];

  const topDoctors = [
    { name: 'Dr. Emily Watson', specialty: 'Cardiologist', bookings: 142, rating: 4.9, revenue: 71000 },
    { name: 'Dr. Sarah Jenkins', specialty: 'Dermatologist', bookings: 128, rating: 4.8, revenue: 51200 },
    { name: 'Dr. Michael Chang', specialty: 'Pediatrician', bookings: 115, rating: 4.7, revenue: 40250 },
    { name: 'Dr. Amanda Ross', specialty: 'Gynecologist', bookings: 98, rating: 4.9, revenue: 39200 }
  ];

  const revenueTimelineData = [
    { name: 'Week 1', gross: 42000, commission: 6300 },
    { name: 'Week 2', gross: 48000, commission: 7200 },
    { name: 'Week 3', gross: 51000, commission: 7650 },
    { name: 'Week 4', gross: 63000, commission: 9450 }
  ];

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can access platform diagnostics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <BarChart3 className="text-blue-600" size={32} /> Platform Analytics
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Platform-wide KPI matrices, growth reports, and funnel analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Filter size={16} className="text-slate-400 mr-2" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 h-[38px]" leftIcon={<Download size={16} />}>
            Export Reports
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'patient', label: 'Patient Insights', icon: Users },
          { id: 'clinic', label: 'Clinic Performance', icon: Building2 },
          { id: 'doctor', label: 'Practitioner Metrics', icon: Stethoscope },
          { id: 'revenue', label: 'Revenue & Commission', icon: IndianRupee }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Analytics Panels */}
      <div className="space-y-8">
        {/* Tab 1: Patient Analytics */}
        {activeTab === 'patient' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Patient Intake Funnel" subtitle="System-wide conversion metrics">
                <Chart type="bar" data={patientFunnelData} dataKey="count" color="#3b82f6" />
              </Card>
              <Card title="Registration Growth Trends" subtitle="New patient registrations over time">
                <Chart type="line" data={patientGrowthData} dataKey="count" color="#10b981" />
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card title="Loyalty & Retention" subtitle="Key engagement indicators">
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-900">76.4%</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Retention rate</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-900">32.8%</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Repeat consultations</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Activity size={20} />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-900">4.2 / 5</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Avg Patient Satisfaction</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                      ★
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Clinic Performance */}
        {activeTab === 'clinic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Top Clinic Locations" subtitle="Clinics by appointment volume">
              <Table 
                columns={[
                  { header: 'Clinic', accessor: 'name' },
                  { header: 'Appointments', accessor: 'appointments', render: (row) => <span className="font-extrabold text-slate-800">{row.appointments}</span> },
                  { header: 'Patient Retention', accessor: 'retention', render: (row) => <span className="text-emerald-600 font-bold">{row.retention}</span> }
                ]}
                data={topClinicsAppointments}
              />
            </Card>

            <Card title="Top Clinic Revenue Generator" subtitle="Clinics by platform contribution">
              <Table 
                columns={[
                  { header: 'Clinic', accessor: 'name' },
                  { header: 'Gross Earnings', accessor: 'revenue', render: (row) => <span className="text-slate-800 font-black">₹{row.revenue.toLocaleString()}</span> },
                  { header: 'Appointments', accessor: 'appointments', render: (row) => <span className="font-bold text-slate-500">{row.appointments}</span> }
                ]}
                data={topClinicsRevenue}
              />
            </Card>
          </div>
        )}

        {/* Tab 3: Doctor Metrics */}
        {activeTab === 'doctor' && (
          <div className="grid grid-cols-1 gap-6">
            <Card title="Top Practitioners" subtitle="Doctors leading by bookings & patient ratings">
              <Table 
                columns={[
                  { header: 'Practitioner', accessor: 'name', render: (row) => <span className="font-black text-slate-800">{row.name}</span> },
                  { header: 'Specialty', accessor: 'specialty', render: (row) => <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">{row.specialty}</span> },
                  { header: 'Bookings', accessor: 'bookings', render: (row) => <span className="font-bold text-slate-700">{row.bookings}</span> },
                  { header: 'Rating Score', accessor: 'rating', render: (row) => <span className="text-amber-500 font-extrabold">★ {row.rating}</span> },
                  { header: 'Consultation Gross', accessor: 'revenue', render: (row) => <span className="text-emerald-600 font-black">₹{row.revenue.toLocaleString()}</span> }
                ]}
                data={topDoctors}
              />
            </Card>
          </div>
        )}

        {/* Tab 4: Revenue & Commission */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Weekly Platform Yield" subtitle="Gross Platform Revenue vs System Commission (15%)">
                <Chart type="line" data={revenueTimelineData} dataKey="gross" color="#2563eb" />
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card title="Yield Summary" subtitle="Financial analytics overview">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Gross Volume</p>
                     <p className="text-3xl font-black text-slate-900 flex items-center gap-0.5"><IndianRupee size={24} /> 2,04,000</p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                     <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-2">Total Platform Commission</p>
                     <p className="text-3xl font-black text-emerald-700 flex items-center gap-0.5"><IndianRupee size={24} /> 30,600</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-500">Refund Ratio</p>
                      <p className="text-lg font-black text-slate-800 mt-1">1.8%</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full"><TrendingDown size={14} /> Low</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
