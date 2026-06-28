"use client"

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { usersApi } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/dashboard/Table';

export default function PatientDetailsPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await usersApi.getPatientDetails(id);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold">Loading patient history...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-[2.5rem] border border-red-100 max-w-2xl mx-auto mt-12">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-900">Error Loading Details</h2>
        <p className="text-red-600 mt-2">{error || "Patient not found"}</p>
        <Link href="/dashboard/patients" className="inline-block mt-8">
          <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const { patient, appointments } = data;

  const appointmentColumns = [
    { 
      header: 'Doctor', 
      accessor: 'doctor',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {row.doctor?.user?.avatar ? (
              <img src={row.doctor.user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-slate-400">DOC</span>
            )}
          </div>
          <span className="text-sm font-bold text-slate-700">{row.doctor?.user?.name || 'Deleted Doctor'}</span>
        </div>
      )
    },
    { 
      header: 'Date & Time', 
      accessor: 'date',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-slate-900">
            {new Date(row.date).toLocaleDateString('en-GB')}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock size={10} /> {row.slot}
          </div>
        </div>
      )
    },
    { 
      header: 'Reason', 
      accessor: 'reason',
      render: (row) => (
        <div className="max-w-[200px] truncate text-sm text-slate-600" title={row.reason}>
          {row.reason || 'General'}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          row.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
          row.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
          "bg-rose-50 text-rose-600 border-rose-100"
        }`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    { 
      header: 'View', 
      accessor: 'actions',
      render: (row) => (
        <Link href={`/dashboard/appointments?id=${row._id}&filter=all`}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
            <ExternalLink size={14} />
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Profile</h1>
          <p className="text-sm text-slate-500">Overview of medical history and contact information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-0 border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md mx-auto mb-4 flex items-center justify-center border-4 border-white/30 text-3xl font-black">
                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <h2 className="text-2xl font-black tracking-tight">{patient.name}</h2>
              <p className="text-blue-100 text-sm mt-1 opacity-80 uppercase tracking-widest font-bold">Patient ID: {patient._id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Contact Information</h4>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                    <p className="text-sm font-bold text-slate-700">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                    <p className="text-sm font-bold text-slate-700">{patient.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">System Details</h4>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Joined Platform</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Account Status</p>
                    <p className="text-sm font-bold text-slate-700">{patient.isEmailVerified ? "Verified" : "Unverified"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Appointment History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-white p-6 rounded-[2rem]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bookings</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{appointments.length}</h3>
            </Card>
            <Card className="border-none shadow-sm bg-white p-6 rounded-[2rem]">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Confirmed</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{appointments.filter(a => a.status === 'confirmed').length}</h3>
            </Card>
            <Card className="border-none shadow-sm bg-white p-6 rounded-[2rem]">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Cancelled</p>
              <h3 className="text-3xl font-black text-rose-600 mt-1">{appointments.filter(a => a.status === 'cancelled').length}</h3>
            </Card>
          </div>

          <Card className="p-0 border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <ClipboardList size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900">Appointment History</h3>
              </div>
            </div>
            <Table 
              columns={appointmentColumns} 
              data={appointments} 
              pagination={false}
              emptyMessage="This patient hasn't booked any appointments yet."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
