"use client"

import React from 'react';
import { 
  Users, 
  Stethoscope, 
  CalendarCheck, 
  DollarSign, 
  Download, 
  Filter, 
  Plus,
  ArrowRight
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import Chart from '@/components/dashboard/Chart';
import Table from '@/components/dashboard/Table';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const statsData = [
  { title: 'Total Patients', value: '42,908', icon: Users, growth: 12.5, isIncrease: true, color: 'blue' },
  { title: 'Active Doctors', value: '856', icon: Stethoscope, growth: 4.2, isIncrease: true, color: 'green' },
  { title: 'Appointments Today', value: '1,240', icon: CalendarCheck, growth: 8.1, isIncrease: true, color: 'purple' },
  { title: 'Total Revenue', value: '$84,200', icon: DollarSign, growth: 2.3, isIncrease: false, color: 'orange' },
];

const appointmentChartData = [
  { name: 'Mon', appointments: 400 },
  { name: 'Tue', appointments: 300 },
  { name: 'Wed', appointments: 600 },
  { name: 'Thu', appointments: 800 },
  { name: 'Fri', appointments: 500 },
  { name: 'Sat', appointments: 200 },
  { name: 'Sun', appointments: 150 },
];

const revenueChartData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 7000 },
];

const recentAppointments = [
  { id: 1, patient: 'Sarah Johnson', doctor: 'Dr. Michael Chen', time: '09:00 AM', date: 'Oct 24, 2023', status: 'Confirmed' },
  { id: 2, patient: 'Robert Wilson', doctor: 'Dr. Emily Blunt', time: '11:30 AM', date: 'Oct 24, 2023', status: 'Pending' },
  { id: 3, patient: 'Maria Garcia', doctor: 'Dr. James Wilson', time: '02:15 PM', date: 'Oct 24, 2023', status: 'Confirmed' },
  { id: 4, patient: 'David Smith', doctor: 'Dr. Michael Chen', time: '04:00 PM', date: 'Oct 24, 2023', status: 'Cancelled' },
];

const patientTableColumns = [
  { 
    header: 'Patient Name', 
    accessor: 'name',
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
          {row.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.name}</p>
          <p className="text-[10px] text-slate-500">{row.email}</p>
        </div>
      </div>
    )
  },
  { header: 'Gender', accessor: 'gender' },
  { header: 'Age', accessor: 'age' },
  { header: 'Contact', accessor: 'contact' },
  { 
    header: 'Last Visit', 
    accessor: 'lastVisit',
    render: (row) => <span className="text-xs font-medium text-slate-600">{row.lastVisit}</span>
  },
  { 
    header: 'Status', 
    accessor: 'status',
    render: (row) => (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold border",
        row.status === 'Healthy' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
      )}>
        {row.status}
      </span>
    )
  },
];

const patientData = [
  { id: 1, name: 'Alice Thompson', email: 'alice.t@gmail.com', gender: 'Female', age: 28, contact: '+1 234 567 890', lastVisit: '12 Oct, 2023', status: 'Healthy' },
  { id: 2, name: 'Benjamin Carter', email: 'b.carter@outlook.com', gender: 'Male', age: 45, contact: '+1 987 654 321', lastVisit: '15 Oct, 2023', status: 'Warning' },
  { id: 3, name: 'Catherine Wu', email: 'cat.wu@apple.com', gender: 'Female', age: 34, contact: '+1 555 012 345', lastVisit: '18 Oct, 2023', status: 'Healthy' },
  { id: 4, name: 'Daniel Miller', email: 'd.miller@yahoo.com', gender: 'Male', age: 52, contact: '+1 444 222 111', lastVisit: '20 Oct, 2023', status: 'Healthy' },
  { id: 5, name: 'Elena Rodriguez', email: 'e.rod@gmail.com', gender: 'Female', age: 31, contact: '+1 888 777 666', lastVisit: '22 Oct, 2023', status: 'Warning' },
];

function cn(...inputs) {
  return Array.from(new Set(inputs.flat().filter(Boolean))).join(' ');
}

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Healthcare Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, Dr. John Doe. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
            Filter
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
            Export
          </Button>
          <Button size="sm" leftIcon={<Plus size={16} />}>
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <DashboardCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Appointments Over Time" 
          subtitle="Weekly appointment volume tracking"
          action={<Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View Details</Button>}
        >
          <Chart type="line" data={appointmentChartData} dataKey="appointments" color="#0284c7" />
        </Card>
        <Card 
          title="Revenue Analysis" 
          subtitle="Monthly hospital revenue growth"
          action={<Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View Details</Button>}
        >
          <Chart type="bar" data={revenueChartData} dataKey="revenue" color="#10b981" />
        </Card>
      </div>

      {/* Tables and List Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Patients Table */}
        <div className="xl:col-span-2">
          <Card 
            title="Patient Directory" 
            subtitle="Overview of recently admitted patients"
            className="h-full"
            action={<Button variant="ghost" size="sm" rightIcon={<ArrowRight size={16} />}>See All</Button>}
          >
            <Table columns={patientTableColumns} data={patientData} />
          </Card>
        </div>

        {/* Recent Appointments List */}
        <div className="xl:col-span-1">
          <Card 
            title="Recent Appointments" 
            subtitle="Today's scheduled checkups"
            className="h-full"
            action={<Button variant="ghost" size="sm">Manage</Button>}
          >
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} {...appointment} />
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full text-slate-600 border-slate-200">
                View Full Calendar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
