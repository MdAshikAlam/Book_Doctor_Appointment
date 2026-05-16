import React from 'react';
import { 
  UserPlus, CalendarCheck, Clock, CheckCircle2,
  Printer, CreditCard, UserCheck, XCircle, Search, Users, FileText
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import Card from '@/components/common/Card';
import Table from '../Table';
import Button from '@/components/common/Button';

export default function ReceptionistDashboard({ data }) {
  const { stats, queue } = data;

  const iconMap = {
    UserPlus, CalendarCheck, Clock, CheckCircle2, Users, FileText
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, i) => (
          <DashboardCard key={i} {...stat} icon={iconMap[stat.icon] || CalendarCheck} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card 
             title="Live Patient Queue" 
             subtitle="Monitor and manage check-ins"
             action={
                <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Search queue..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none w-48" />
                </div>
             }
           >
              <Table 
                columns={[
                  { header: 'Time', accessor: 'time', render: (row) => <span className="font-black text-slate-900">{row.time}</span> },
                  { header: 'Patient', accessor: 'patientName' },
                  { header: 'Doctor', accessor: 'doctorName', render: (row) => <span className="text-xs font-medium text-slate-600">Dr. {row.doctorName}</span> },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    render: (row) => (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        row.status === 'booked' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        row.status === 'checked_in' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        row.status === 'missed' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {row.status}
                      </span>
                    )
                  },
                  {
                    header: 'Actions',
                    accessor: 'id',
                    render: (row) => (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="xs" className="text-emerald-600 hover:bg-emerald-50" title="Check In">
                           <UserCheck size={14}/>
                        </Button>
                        <Button variant="ghost" size="xs" className="text-slate-400 hover:bg-slate-50" title="Print Token">
                           <Printer size={14}/>
                        </Button>
                      </div>
                    )
                  }
                ]} 
                data={queue || []} 
              />
           </Card>
        </div>

        <div className="space-y-6">
           <Card title="Quick Actions" subtitle="Front desk operations">
              <div className="grid grid-cols-1 gap-3">
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <UserPlus size={18} className="text-blue-500" /> New Registration
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <CalendarCheck size={18} className="text-emerald-500" /> Book Appointment
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <CreditCard size={18} className="text-indigo-500" /> Generate Bill
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <Printer size={18} className="text-slate-500" /> Print Daily Report
                 </Button>
              </div>
           </Card>

           <Card title="Billing Summary" subtitle="Pending payments">
              <div className="space-y-3">
                 <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Unpaid Bills</span>
                    <span className="text-sm font-black text-orange-800">14</span>
                 </div>
                 <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Collected</span>
                    <span className="text-sm font-black text-emerald-800">₹8,450</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
