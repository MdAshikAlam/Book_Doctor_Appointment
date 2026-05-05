"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  MapPin,
  Eye,
  Mail,
  Phone,
  Shield,
  CalendarCheck,
  CreditCard,
  Activity
} from 'lucide-react';
import { appointmentsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // upcoming, confirmed, pending
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [completingAppointment, setCompletingAppointment] = useState(null);
  const [medicalForm, setMedicalForm] = useState({ diagnosis: '', prescription: '', notes: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', slot: '' });
  const [activeMenu, setActiveMenu] = useState(null);

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

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      await appointmentsApi.updateStatus(id, { status, ...extraData });
      if (status === 'completed') {
        router.push('/dashboard/patients');
      } else {
        fetchAppointments();
      }
      setCompletingAppointment(null);
      setMedicalForm({ diagnosis: '', prescription: '', notes: '' });
      setActiveMenu(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReschedule = async () => {
    try {
      if (!rescheduleData.date || !rescheduleData.slot) {
        alert('Please select both date and slot');
        return;
      }
      await appointmentsApi.reschedule(reschedulingAppointment._id, rescheduleData);
      setReschedulingAppointment(null);
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    // Hide cancelled appointments by default unless we are specifically looking for them (which we won't on this page anymore)
    if (app.status === 'cancelled') return false;
    
    let matchesFilter = false;
    const appDate = new Date(app.date).toDateString();
    const today = new Date().toDateString();

    if (filter === 'upcoming') {
      matchesFilter = app.status === 'confirmed' || app.status === 'pending';
    } else if (filter === 'today') {
      matchesFilter = appDate === today && (app.status === 'confirmed' || app.status === 'pending');
    } else {
      matchesFilter = app.status === filter;
    }
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Consultations</h1>
          <p className="text-slate-400 mt-2 font-bold text-sm uppercase tracking-[0.1em]">
            {user?.role === 'admin' ? 'Administrative Control Center' : 'Clinical Schedule Overview'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex items-center gap-1">
            {['upcoming', 'today', 'pending', 'confirmed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                  filter === f 
                    ? "bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={app._id}
                  className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 overflow-hidden group"
                >
                  <div className="p-1">
                    <div className="flex flex-col lg:flex-row lg:items-stretch">
                      {/* Date Block */}
                      <div className="lg:w-32 bg-slate-50/50 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{new Date(app.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{new Date(app.date).getDate()}</p>
                        <div className="h-1 w-6 bg-blue-600 rounded-full mt-2" />
                      </div>

                      {/* Main Info Area */}
                      <div className="flex-1 p-6 lg:p-8 flex flex-col md:flex-row md:items-center gap-8">
                        {/* Time & Reason */}
                        <div className="md:w-48 space-y-2">
                          <div className="flex items-center gap-2 text-slate-900">
                            <Clock size={16} className="text-blue-600" />
                            <span className="text-base font-black tracking-tight">{app.slot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-200" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest truncate max-w-[140px]">{app.reason || 'General Checkup'}</p>
                          </div>
                        </div>

                        {/* Participants */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                              <User size={24} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Patient</p>
                              <p className="text-sm font-black text-slate-900 truncate">{app.fullName || app.patient?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                              <Stethoscope size={24} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Assigned Physician</p>
                              <p className="text-sm font-black text-slate-900 truncate">Dr. {app.doctor?.user?.name || 'Expert'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="lg:w-80 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50/30 flex items-center justify-between lg:flex-col lg:justify-center lg:gap-4">
                        <div className={cn(
                          "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all",
                          getStatusColor(app.status)
                        )}>
                          {app.status}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingAppointment(app)}
                            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                            title="View Record"
                          >
                            <Eye size={20} />
                          </button>

                          {(user?.role === 'admin' || user?.role === 'receptionist') && app.status === 'pending' && (
                            <button 
                              onClick={() => handleStatusUpdate(app._id, 'confirmed')}
                              className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                              title="Confirm Appointment"
                            >
                              <CalendarCheck size={20} />
                            </button>
                          )}

                          {user?.role === 'doctor' && app.status === 'confirmed' && (
                            <button 
                              onClick={() => setCompletingAppointment(app)}
                              className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                              title="Finalize Consultation"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          )}

                          {(user?.role === 'admin' || user?.role === 'receptionist') && app.status === 'confirmed' && (
                            <button 
                              onClick={() => handleStatusUpdate(app._id, 'visited')}
                              className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                              title="Mark as Visited"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          )}

                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === app._id ? null : app._id);
                              }}
                              className={cn(
                                "w-11 h-11 rounded-2xl transition-all border flex items-center justify-center",
                                activeMenu === app._id ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              <MoreVertical size={20} />
                            </button>

                          <AnimatePresence>
                            {activeMenu === app._id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveMenu(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                                >
                                  <div className="p-2">
                                    <button 
                                      onClick={() => {
                                        setViewingAppointment(app);
                                        setActiveMenu(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                      <Eye size={18} className="text-slate-400" />
                                      Full Details
                                    </button>
                                    
                                    {(app.status === 'pending' || app.status === 'confirmed') && (
                                      <button 
                                        onClick={() => {
                                          setReschedulingAppointment(app);
                                          setRescheduleData({ date: app.date.split('T')[0], slot: app.slot });
                                          setActiveMenu(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                                      >
                                        <Calendar size={18} className="text-slate-400" />
                                        Reschedule
                                      </button>
                                    )}

                                    {app.status === 'confirmed' && (user?.role === 'doctor' || user?.role === 'admin') && (
                                      <button 
                                        onClick={() => {
                                          if (user?.role === 'doctor') {
                                            setCompletingAppointment(app);
                                          } else {
                                            handleStatusUpdate(app._id, 'completed');
                                          }
                                          setActiveMenu(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                      >
                                        <CheckCircle2 size={18} />
                                        Mark Completed
                                      </button>
                                    )}

                                    {(user?.role === 'admin' || user?.role === 'receptionist') && app.status === 'confirmed' && (
                                      <button 
                                        onClick={() => {
                                          handleStatusUpdate(app._id, 'visited');
                                          setActiveMenu(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                      >
                                        <CheckCircle2 size={18} />
                                        Mark Visited
                                      </button>
                                    )}

                                    <div className="h-px bg-slate-50 my-2" />

                                    <a 
                                      href={`tel:${app.phone}`}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                      <Phone size={18} className="text-slate-400" />
                                      Call Patient
                                    </a>

                                    {(app.status === 'pending' || app.status === 'confirmed') && (
                                      <button 
                                        onClick={() => {
                                          handleStatusUpdate(app._id, 'cancelled');
                                          setActiveMenu(null);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                      >
                                        <XCircle size={18} />
                                        Cancel Appointment
                                      </button>
                                    )}
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-6 px-8 pb-8">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full">
                      <MessageSquare size={14} className="text-blue-500" />
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Reason:</span> 
                      <span className="text-slate-600 font-bold">{app.reason || 'Not Specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Location:</span> 
                      <span className="text-slate-600 font-bold">{app.city}, {app.country}</span>
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
              {/* Modal Header */}
              <div className="p-8 bg-slate-900 text-white relative">
                <button 
                  onClick={() => setViewingAppointment(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <XCircle size={24} />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20">
                    {viewingAppointment.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none">{viewingAppointment.fullName}</h3>
                    <div className="flex items-center gap-2 mt-2 opacity-70 text-xs font-bold uppercase tracking-widest">
                       <Calendar size={12} />
                       Scheduled for {formatDate(viewingAppointment.date)} at {viewingAppointment.slot}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  getStatusColor(viewingAppointment.status)
                )}>
                  {viewingAppointment.status}
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Personal Info */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <User size={14} /> Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="Email Address" value={viewingAppointment.email} icon={<Mail size={14} />} />
                    <DetailItem label="Phone Number" value={viewingAppointment.phone} icon={<Phone size={14} />} />
                    <DetailItem label="Gender" value={viewingAppointment.gender} icon={<Activity size={14} />} />
                    <DetailItem label="Date of Birth" value={new Date(viewingAppointment.dob).toLocaleDateString()} icon={<CalendarCheck size={14} />} />
                    <DetailItem label="Aadhaar ID" value={viewingAppointment.aadhaar} icon={<CreditCard size={14} />} className="col-span-2" />
                  </div>
                </div>

                {/* Location Info */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Contact & Address
                  </h4>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Patient Home Address</p>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
                      {viewingAppointment.address}, {viewingAppointment.city}, {viewingAppointment.country}
                    </p>
                  </div>
                </div>

                {/* Medical Context */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Stethoscope size={14} /> Consultation Context
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                      <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Reason for Visit</p>
                      <p className="text-sm font-black text-slate-900">{viewingAppointment.reason}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">First Time Visit?</p>
                      <p className="text-sm font-black text-slate-900">{viewingAppointment.visitedBefore ? 'Yes, Returning Patient' : 'No, New Patient'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 col-span-2">
                       <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Doctor Assigned</p>
                       <p className="text-sm font-black text-slate-900">Dr. {viewingAppointment.doctor?.user?.name || 'Pending Assignment'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={() => setViewingAppointment(null)}
                  className="w-full h-14 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {reschedulingAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Reschedule</h3>
                  <p className="text-sm text-slate-500 font-medium italic">Extend date or change slot</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Appointment Date</label>
                  <input 
                    type="date" 
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Time Slot</label>
                  <input 
                    type="time" 
                    value={rescheduleData.slot}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, slot: e.target.value })}
                    className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => setReschedulingAppointment(null)}
                  className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReschedule}
                  className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Reschedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Medical Summary Modal */}
      <AnimatePresence>
        {completingAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative">
                <button 
                  onClick={() => setCompletingAppointment(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <XCircle size={24} />
                </button>
                <h3 className="text-2xl font-black mb-2">Medical Consultation Summary</h3>
                <p className="text-emerald-50/80 text-sm font-medium">
                  Add diagnosis and prescriptions for <span className="text-white font-bold">{completingAppointment.fullName}</span>
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Diagnosis</label>
                  <textarea 
                    value={medicalForm.diagnosis}
                    onChange={(e) => setMedicalForm({...medicalForm, diagnosis: e.target.value})}
                    placeholder="Enter patient diagnosis..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all outline-none text-sm font-bold min-h-[100px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prescription</label>
                  <textarea 
                    value={medicalForm.prescription}
                    onChange={(e) => setMedicalForm({...medicalForm, prescription: e.target.value})}
                    placeholder="List medications and dosage..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all outline-none text-sm font-bold min-h-[100px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Additional Notes</label>
                  <textarea 
                    value={medicalForm.notes}
                    onChange={(e) => setMedicalForm({...medicalForm, notes: e.target.value})}
                    placeholder="Internal clinical notes..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white transition-all outline-none text-sm font-bold min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
                <button 
                  onClick={() => setCompletingAppointment(null)}
                  className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusUpdate(completingAppointment._id, 'completed', medicalForm)}
                  className="flex-[2] h-14 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Complete Consultation
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
    <div className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm ${className}`}>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="text-sm font-black text-slate-900 truncate">{value || 'N/A'}</p>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
