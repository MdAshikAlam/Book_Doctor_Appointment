import React from 'react';
import { 
  Stethoscope, Users, CalendarCheck, CheckCircle2, 
  Clock, IndianRupee, Plus, Settings, FileText
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import Card from '@/components/common/Card';
import Table from '../Table';
import Button from '@/components/common/Button';

export default function AdminDashboard({ data }) {
  const { stats, upcomingAppointments } = data;

  const iconMap = {
    Stethoscope, Users, CalendarCheck, CheckCircle2, Clock, IndianRupee
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats?.map((stat, i) => (
          <DashboardCard key={i} {...stat} icon={iconMap[stat.icon] || CalendarCheck} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card 
             title="Upcoming Appointments" 
             subtitle="Confirmed bookings for the next 24 hours"
             action={<Button variant="ghost" size="sm" className="text-blue-600">View Schedule</Button>}
           >
              <Table 
                columns={[
                  { header: 'Patient', accessor: 'patient' },
                  { header: 'Doctor', accessor: 'doctor', render: (row) => <span className="font-medium text-slate-600">Dr. {row.doctor}</span> },
                  { header: 'Slot', accessor: 'time', render: (row) => <span className="font-bold text-slate-900">{row.time}</span> },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    render: (row) => (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                        {row.status}
                      </span>
                    )
                  }

                ]} 
                data={upcomingAppointments || []} 
              />
           </Card>
        </div>
        
        <div className="space-y-6">
           <Card title="Quick Actions" subtitle="Administrative tasks">
              <div className="grid grid-cols-1 gap-3">
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <Plus size={18} className="text-blue-500" /> Add New Doctor
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <Users size={18} className="text-emerald-500" /> Register Patient
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <Settings size={18} className="text-slate-500" /> Clinic Settings
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <FileText size={18} className="text-indigo-500" /> Export Reports
                 </Button>
              </div>
           </Card>

           <Card title="Staff Overview" subtitle="Duty status">
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-xs font-bold text-slate-700">Doctors Online</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">12 / 15</span>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-xs font-bold text-slate-700">Reception Active</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">4 / 4</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
