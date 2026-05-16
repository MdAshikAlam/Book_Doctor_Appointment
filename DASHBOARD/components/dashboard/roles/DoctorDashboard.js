import React from 'react';
import { 
  Users, CalendarCheck, CheckCircle2, Clock, 
  Play, ClipboardList, Upload, CheckCircle, 
  PlusCircle, FilePlus, LogOut, ArrowRight
} from 'lucide-react';
import DashboardCard from '../DashboardCard';
import Card from '@/components/common/Card';
import Table from '../Table';
import Button from '@/components/common/Button';

export default function DoctorDashboard({ data }) {
  const { stats, schedule } = data;

  const iconMap = {
    Users, CalendarCheck, CheckCircle2, Clock
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, i) => (
          <DashboardCard key={i} {...stat} icon={iconMap[stat.icon] || Users} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card 
             title="Today's Appointment Queue" 
             subtitle="Real-time patient visits"
             action={<Button variant="ghost" size="sm" className="text-blue-600">Full Schedule</Button>}
           >
              <Table 
                columns={[
                  { header: 'Time', accessor: 'timeSlot', render: (row) => <span className="font-black text-slate-900">{row.timeSlot}</span> },
                  { header: 'Patient Name', accessor: 'patientName' },
                  { header: 'Type', accessor: 'type', render: (row) => <span className="text-[10px] font-bold text-slate-500 uppercase">{row.type}</span> },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    render: (row) => (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        row.status === 'booked' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        row.status === 'checked_in' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        row.status === 'draft_prepared' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        row.status === 'missed' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {row.status?.replace('_', ' ')}
                      </span>
                    )
                  },
                  {
                    header: 'Actions',
                    accessor: 'id',
                    render: (row) => (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="xs" className="text-blue-600 hover:bg-blue-50">
                           <Play size={12} className="mr-1"/> Start
                        </Button>
                      </div>
                    )
                  }
                ]} 

                data={schedule || []} 
              />
           </Card>
        </div>

        <div className="space-y-6">
           <Card title="Patient Management" subtitle="Quick treatment actions">
              <div className="grid grid-cols-1 gap-3">
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <ClipboardList size={18} className="text-blue-500" /> Add Diagnosis
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <FilePlus size={18} className="text-emerald-500" /> Write Prescription
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <Upload size={18} className="text-indigo-500" /> Upload Reports
                 </Button>
                 <Button className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" variant="outline">
                    <PlusCircle size={18} className="text-amber-500" /> Recommend Tests
                 </Button>
              </div>
           </Card>

           <Card title="Recent Patients" subtitle="Last consultations">
              <div className="space-y-4">
                 {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">P{i}</div>
                          <div>
                             <p className="text-xs font-bold text-slate-900">Patient Name</p>
                             <p className="text-[10px] text-slate-400">Follow-up: 24 Oct</p>
                          </div>
                       </div>
                       <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
