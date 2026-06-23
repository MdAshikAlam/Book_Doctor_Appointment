"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Stethoscope, 
  CalendarCheck, 
  DollarSign, 
  Download, 
  Filter, 
  Plus,
  ArrowRight,
  IndianRupee,
  TrendingUp,
  Star,
  Building2,
  AlertCircle
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import Chart from '@/components/dashboard/Chart';
import Table from '@/components/dashboard/Table';
import AppointmentCard from '@/components/dashboard/AppointmentCard';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/context/AuthContext';
import { apiCall } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const iconMap = {
  Users: Users,
  Stethoscope: Stethoscope,
  CalendarCheck: CalendarCheck,
  DollarSign: DollarSign,
  IndianRupee: IndianRupee,
  TrendingUp: TrendingUp
};

import SuperAdminDashboard from '@/components/dashboard/roles/SuperAdminDashboard';
import AdminDashboard from '@/components/dashboard/roles/AdminDashboard';
import DoctorDashboard from '@/components/dashboard/roles/DoctorDashboard';
import ReceptionistDashboard from '@/components/dashboard/roles/ReceptionistDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'doctor') {
      router.push('/dashboard/queue');
    }
  }, [user, router]);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRange, setFilterRange] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        let endpoint = `/analytics/dashboard-stats`;
        const params = new URLSearchParams();
        if (filterRange) {
          params.append('range', filterRange);
        } else if (selectedDate) {
          params.append('date', selectedDate);
        } else {
          params.append('range', 'today');
        }

        endpoint += `?${params.toString()}`;
        const data = await apiCall(endpoint);
        setDashboardData(data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError(err.message || 'Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filterRange, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Synchronizing Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm max-w-4xl mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Failed to Load Dashboard</h3>
        <p className="text-slate-500 mt-2 font-medium max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderDashboard = () => {
    if (!dashboardData) return null;

    const props = {
      data: dashboardData,
      selectedDate: selectedDate,
      onDateSelect: (date) => {
        setFilterRange('');
        setSelectedDate(date);
      }
    };

    switch (user?.role) {
      case 'super_admin':
        return <SuperAdminDashboard {...props} />;
      case 'admin':
        if (dashboardData.hasClinics === false) {
          return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <Building2 size={40} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome to BookMyDoctor</h1>
              <p className="text-slate-500 mt-3 font-medium max-w-md mx-auto leading-relaxed">
                You have not created any clinics yet. Create your first clinic workspace to start configuring doctors, receptionists, and booking schedules.
              </p>
              <div className="mt-8">
                <Link href="/dashboard/clinics?action=create">
                  <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
                    <Plus size={20} /> Create Your First Clinic
                  </Button>
                </Link>
              </div>
            </div>
          );
        }
        return <AdminDashboard {...props} />;
      case 'doctor':
        return <DoctorDashboard {...props} />;
      case 'receptionist':
        return <ReceptionistDashboard {...props} />;
      default:
        return (
          <div className="p-20 text-center">
             <h2 className="text-xl font-bold text-slate-400 italic">Welcome to BookMyDoc Dashboard</h2>
             <p className="text-slate-500 mt-2 font-medium">Please select a menu option to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
             {user?.role === 'super_admin' ? 'System Overview' : 
              user?.role === 'admin' ? 'Clinic Dashboard' :
              user?.role === 'doctor' ? 'Practice Overview' : 'Reception Desk'}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
             Manage your healthcare operations and patient flow with ease.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm hover:border-slate-300 transition duration-200">
            <Filter size={16} className="text-slate-400 mr-2" />
            <select
              value={filterRange || 'custom'}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== 'custom') {
                  setFilterRange(val);
                  setSelectedDate(null);
                }
              }}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-4 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right -4px center', backgroundSize: '18px', backgroundRepeat: 'no-repeat' }}
            >
              {selectedDate && <option value="custom" disabled>Custom Date ({selectedDate})</option>}
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 1 Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last 1 Year</option>
            </select>
          </div>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 h-[38px]" leftIcon={<Download size={16} />}>
            Reports
          </Button>
        </div>
      </div>

      {renderDashboard()}
    </div>
  );
}

