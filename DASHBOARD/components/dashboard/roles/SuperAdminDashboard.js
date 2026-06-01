import React from 'react';
import Link from 'next/link';
import { 
  Users, Building2, ShieldCheck, Stethoscope, 
  CalendarCheck, TrendingUp, AlertCircle, IndianRupee,
  Activity, CheckCircle2, Clock, ShieldAlert,
  ArrowUpRight, BarChart3, HelpCircle, FileText, Ban
} from 'lucide-react';
import Card from '@/components/common/Card';
import Chart from '../Chart';
import Table from '../Table';
import CalendarWidget from '../CalendarWidget';

export default function SuperAdminDashboard({ data, selectedDate, onDateSelect }) {
  const { 
    approvalQueue = {}, 
    platformMetrics = {}, 
    appointmentMetrics = {}, 
    businessMetrics = {}, 
    supportMetrics = {},
    appointmentChartData = [],
    branchPerformance = [],
    recentActivity = []
  } = data || {};

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 1. Approval Queue (Most Important Module) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="text-rose-500" size={20} />
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Verification & Approval Center</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/clinic-verification" className="group">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                  <Building2 size={24} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  Queue <ArrowUpRight size={12} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-4">
                {approvalQueue.pendingClinics || 0}
              </p>
              <h3 className="text-sm font-black text-slate-700 mt-1">Pending Clinic Verifications</h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">Verify clinic registration details and activate branch environments.</p>
            </div>
          </Link>

          <Link href="/dashboard/doctor-verification" className="group">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  <Stethoscope size={24} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Queue <ArrowUpRight size={12} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-4">
                {approvalQueue.pendingDoctors || 0}
              </p>
              <h3 className="text-sm font-black text-slate-700 mt-1">Pending Doctor Verifications</h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">Verify professional licenses, experience, and certifications.</p>
            </div>
          </Link>

          <Link href="/dashboard/kyc-verification" className="group">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
                  <FileText size={24} />
                </div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-purple-600 transition-colors flex items-center gap-1">
                  Queue <ArrowUpRight size={12} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-4">
                {approvalQueue.pendingKyc || 0}
              </p>
              <h3 className="text-sm font-black text-slate-700 mt-1">Pending KYC Reviews</h3>
              <p className="text-xs text-slate-400 mt-2 font-medium">Audit state registration certificates and legal identity files.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Platform Metrics (Total Counts) */}
      <div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{platformMetrics.activeClinics || 0}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Active Clinics</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{platformMetrics.activeClinicAdmins || 0}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Clinic Admins</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{platformMetrics.activeDoctors || 0}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Active Doctors</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{platformMetrics.activeReceptionists || 0}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Active Receptionists</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{platformMetrics.registeredPatients || 0}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Registered Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Metrics Categories: Appointments, Business, Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Appointment Stats Card */}
        <Card title="Appointment Metrics" subtitle="Daily transaction logs">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Booked Today</span>
              <span className="text-sm font-black text-slate-800">{appointmentMetrics.bookedToday || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Confirmed Today</span>
              <span className="text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{appointmentMetrics.confirmedToday || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Completed Today</span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{appointmentMetrics.completedToday || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Cancelled Today</span>
              <span className="text-sm font-black text-rose-650 bg-rose-50 px-2.5 py-0.5 rounded-full">{appointmentMetrics.cancelledToday || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase">No Shows Today</span>
              <span className="text-sm font-black text-slate-650 bg-slate-50 px-2.5 py-0.5 rounded-full">{appointmentMetrics.noShowToday || 0}</span>
            </div>
          </div>
        </Card>

        {/* Business Metrics Card */}
        <Card title="Business & Revenue" subtitle="Financial health summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Platform Gross</span>
              <span className="text-sm font-black text-slate-800 flex items-center gap-0.5"><IndianRupee size={12} /> {(businessMetrics.platformRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Commission (15%)</span>
              <span className="text-sm font-black text-emerald-600 flex items-center gap-0.5"><IndianRupee size={12} /> {(businessMetrics.commissionRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Monthly Volume</span>
              <span className="text-sm font-black text-slate-800 flex items-center gap-0.5"><IndianRupee size={12} /> {(businessMetrics.monthlyRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">Growth Rate</span>
              <span className="text-sm font-black text-emerald-600 flex items-center gap-1"><TrendingUp size={14} /> +{(businessMetrics.monthlyGrowthRate || 0)}%</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase">Repeat Patient Rate</span>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{(businessMetrics.repeatPatientRate || 0)}%</span>
            </div>
          </div>
        </Card>

        {/* Support Metrics Card */}
        <Card title="Support & Safety" subtitle="System alerts & feedback">
          <div className="space-y-4">
            <Link href="/dashboard/support" className="flex justify-between items-center py-2.5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors rounded-xl px-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Open Support Tickets</span>
              <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                {supportMetrics.openTickets || 0} <ArrowUpRight size={12} />
              </span>
            </Link>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Escalated Disputes</span>
              <span className="text-sm font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">{supportMetrics.escalatedCases || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 px-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Reported Accounts</span>
              <span className="text-sm font-black text-slate-800">{supportMetrics.reportedAccounts || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Trends and Performance Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Appointment Booking Trends" subtitle="Weekly volume analysis">
          <Chart type="line" data={appointmentChartData} dataKey="appointments" color="#2563eb" />
        </Card>

        <Card title="Top Clinic Branches" subtitle="Leading clinics by volume and performance">
          <Table 
            columns={[
              { header: 'Clinic Name', accessor: 'name' },
              { 
                header: 'Appointments', 
                accessor: 'appointmentCount', 
                render: (row) => <span className="font-extrabold text-slate-800">{row.appointmentCount}</span> 
              },
              { 
                header: 'Avg Rating', 
                accessor: 'rating', 
                render: () => <span className="text-amber-500 font-bold flex items-center gap-1">★ 4.8</span> 
              }
            ]} 
            data={branchPerformance || []} 
          />
        </Card>
      </div>

      {/* 5. Live Feed & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Audit Activity Log" subtitle="Recent administration events">
            <div className="space-y-4">
              {recentActivity?.map(activity => (
                <div key={activity.id} className="flex gap-4 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100/60 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 shadow-sm">
                    {activity.type === 'registration' ? <Building2 size={16} /> : activity.type === 'approval' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Activity size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <CalendarWidget selectedDate={selectedDate} onDateSelect={onDateSelect} />
        </div>
      </div>

    </div>
  );
}
