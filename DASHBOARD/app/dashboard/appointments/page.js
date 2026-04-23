"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Filter,
  Search,
  ChevronRight,
  MoreVertical,
  MessageSquare,
  MapPin
} from 'lucide-react';
import { appointmentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // all, confirmed, pending, cancelled
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.getMy();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = 
      app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            {user?.role === 'admin' ? 'Platform-wide overview of all medical bookings.' : 'Manage your upcoming and past medical consultations.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex">
            {['all', 'pending', 'confirmed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                  filter === f ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search patient, doctor, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
              />
            </div>
            <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="bg-blue-600 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg shadow-blue-100">
          <div>
            <p className="text-xs font-bold text-blue-100 uppercase">Upcoming</p>
            <p className="text-2xl font-black">{filteredAppointments.filter(a => a.status === 'confirmed').length}</p>
          </div>
          <Calendar size={32} className="text-blue-400 opacity-50" />
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-400 mt-4 font-bold">Synchronizing schedule...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No appointments found</h3>
            <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode='popLayout'>
              {filteredAppointments.map((app) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={app._id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Date/Time Block */}
                    <div className="flex items-center gap-4 lg:w-48 lg:border-r lg:border-slate-100 pr-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600">
                        <p className="text-[10px] font-black uppercase leading-none">{new Date(app.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-lg font-black leading-none mt-1">{new Date(app.date).getDate()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{app.slot}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Time Slot</p>
                      </div>
                    </div>

                    {/* Patient & Doctor */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Patient</p>
                          <p className="text-sm font-black text-slate-900">{app.patient?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-400">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Doctor</p>
                          <p className="text-sm font-black text-slate-900">Dr. {app.doctor?.user?.name || 'Assigned Expert'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between lg:w-72 pl-6 lg:border-l lg:border-slate-100">
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors",
                        getStatusColor(app.status)
                      )}>
                        {app.status}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {app.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(app._id, 'confirmed')}
                              className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
                              title="Confirm Appointment"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(app._id, 'cancelled')}
                              className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-100"
                              title="Cancel Appointment"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        )}
                        <button className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <MessageSquare size={14} className="text-slate-300" />
                      <span className="font-bold text-slate-700">Reason:</span> {app.reason}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="font-bold text-slate-700">Location:</span> {app.city}, {app.country}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
