import React from 'react';
import { 
  Users, Home, ShieldCheck, Stethoscope, 
  CalendarCheck, TrendingUp, AlertCircle, IndianRupee,
  Activity, CheckCircle2, Clock
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import Chart from '../Chart';
import Card from '@/components/common/Card';
import Table from '../Table';
import Button from '@/components/common/Button';
import CalendarWidget from '../CalendarWidget';

export default function SuperAdminDashboard({ data, selectedDate, onDateSelect }) {
  const { stats, appointmentChartData, branchPerformance, recentActivity } = data;

  const iconMap = {
    Home, Users, ShieldCheck, Stethoscope, 
    CalendarCheck, TrendingUp, AlertCircle, IndianRupee
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, i) => (
          <DashboardCard key={i} {...stat} icon={iconMap[stat.icon] || Activity} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Appointment Trends" subtitle="Weekly system-wide bookings">
          <Chart type="line" data={appointmentChartData} dataKey="appointments" color="#6366f1" />
        </Card>
        <Card title="Branch Performance" subtitle="Top clinics by appointment volume">
          <Table 
            columns={[
              { header: 'Clinic Name', accessor: 'name' },
              { header: 'Appointments', accessor: 'appointmentCount', render: (row) => <span className="font-bold">{row.appointmentCount}</span> },
              { header: 'Revenue', accessor: 'revenue', render: (row) => <span className="text-emerald-600 font-bold">₹{row.revenue.toLocaleString()}</span> }
            ]} 
            data={branchPerformance || []} 
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card title="System Health & Status" subtitle="Real-time monitoring">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Server Status</p>
                       <p className="text-lg font-black text-emerald-700">Operational</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                       <Activity size={20} />
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Database</p>
                       <p className="text-lg font-black text-blue-700">Synced</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm">
                       <Clock size={20} />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
        <div className="space-y-6">
           <CalendarWidget selectedDate={selectedDate} onDateSelect={onDateSelect} />

           <Card title="Recent Activity" subtitle="Live system updates">
              <div className="space-y-4">
                 {recentActivity?.map(activity => (
                    <div key={activity.id} className="flex gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          {activity.type === 'registration' ? <Home size={14} /> : <CheckCircle2 size={14} />}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-900">{activity.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{activity.time}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
