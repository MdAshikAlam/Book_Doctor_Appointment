"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  XCircle, 
  Loader2,
  Filter,
  Search,
  MapPin,
  Eye,
  Mail,
  Phone,
  Activity
} from 'lucide-react';
import { appointmentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CancelledAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingAppointment, setViewingAppointment] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      // Specifically fetch cancelled appointments from the API
      const res = await appointmentsApi.getMy('cancelled');
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

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-red-600 tracking-tight">Cancelled Appointments</h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Review rejected or cancelled consultation requests.
          </p>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search patient, doctor, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-600 transition-all outline-none font-medium text-sm"
              />
            </div>
          </div>
        </div>
        <div className="bg-red-500 rounded-3xl p-4 text-white flex items-center justify-between shadow-lg shadow-red-100">
          <div>
            <p className="text-xs font-bold text-red-100 uppercase">Total Cancelled</p>
            <p className="text-2xl font-black">{appointments.length}</p>
          </div>
          <XCircle size={32} className="text-red-300 opacity-50" />
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <Loader2 size={40} className="animate-spin text-red-600 mx-auto" />
            <p className="text-slate-400 mt-4 font-bold">Loading records...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200">
              <XCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No cancelled appointments</h3>
            <p className="text-slate-500 mt-2 font-medium">All clear! No rejected or cancelled requests found.</p>
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
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group border-l-4 border-l-red-500"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Date/Time Block */}
                    <div className="flex items-center gap-4 lg:w-48 lg:border-r lg:border-slate-100 pr-6">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 flex flex-col items-center justify-center text-red-600">
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
                          <p className="text-sm font-black text-slate-900">{app.fullName || app.patient?.name}</p>
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
                    <div className="flex items-center justify-end lg:w-32 pl-6 lg:border-l lg:border-slate-100">
                      <button 
                        onClick={() => setViewingAppointment(app)}
                        className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Activity size={14} className="text-red-400" />
                      <span className="font-bold text-slate-700">Status:</span> 
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase">Cancelled</span>
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

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 bg-red-600 text-white relative">
                <button 
                  onClick={() => setViewingAppointment(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <XCircle size={24} />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white text-red-600 flex items-center justify-center text-2xl font-black">
                    {viewingAppointment.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none">{viewingAppointment.fullName}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-80">
                      Cancelled Consultation
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Email" value={viewingAppointment.email} icon={<Mail size={14} />} />
                  <DetailItem label="Phone" value={viewingAppointment.phone} icon={<Phone size={14} />} />
                  <DetailItem label="Date" value={formatDate(viewingAppointment.date)} icon={<Calendar size={14} />} />
                  <DetailItem label="Slot" value={viewingAppointment.slot} icon={<Clock size={14} />} />
                </div>
                
                <div>
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Patient Address</h4>
                   <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900">
                     {viewingAppointment.address}, {viewingAppointment.city}, {viewingAppointment.country}
                   </div>
                </div>

                <div>
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Consultation Details</h4>
                   <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-sm font-black text-red-700">
                     Reason: {viewingAppointment.reason}
                   </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100">
                <button 
                  onClick={() => setViewingAppointment(null)}
                  className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all"
                >
                  Close Records
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value, icon, className = "" }) {
  return (
    <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 ${className}`}>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="text-sm font-black text-slate-900">{value || 'N/A'}</p>
    </div>
  );
}
