import React from 'react';
import { 
  Stethoscope, Users, CalendarCheck, CheckCircle2, 
  Clock, IndianRupee, Plus, Settings, FileText
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import Card from '@/components/common/Card';
import Table from '../Table';
import Button from '@/components/common/Button';
import Chart from '../Chart';
import CalendarWidget from '../CalendarWidget';

export default function AdminDashboard({ data, selectedDate, onDateSelect }) {
  const { stats, upcomingAppointments } = data;

  const iconMap = {
    Stethoscope, Users, CalendarCheck, CheckCircle2, Clock, IndianRupee
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, i) => (
          <DashboardCard key={i} {...stat} icon={iconMap[stat.icon] || CalendarCheck} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card 
             title="Appointment Volume Trend" 
             subtitle="Visual representation of patient flow over time"
           >
             <Chart type="line" data={data.appointmentChartData || []} dataKey="appointments" color="#0ea5e9" />
           </Card>

           <Card 
             title="Appointments Listing" 
             subtitle="Bookings for the selected filter range"
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
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        row.status === 'booked' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        row.status === 'checked_in' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                        row.status === 'waiting' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        row.status === 'in_consultation' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        row.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        row.status === 'follow_up' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                        row.status === 'patient_missed' ? 'bg-red-50 text-red-600 border-red-100' :
                        row.status === 'cancelled' ? 'bg-slate-50 text-slate-600 border-slate-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {row.status === 'waiting' ? 'Waiting Queue' : row.status === 'patient_missed' ? 'Patient Missed' : row.status?.replace('_', ' ')}
                      </span>
                    )
                  }
                ]} 
                data={upcomingAppointments || []} 
              />
           </Card>
        </div>
        
        <div className="space-y-6">
           <CalendarWidget selectedDate={selectedDate} onDateSelect={onDateSelect} />

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
