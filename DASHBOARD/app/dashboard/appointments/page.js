"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Activity,
  Plus,
  Pill,
  ClipboardList,
  FileText,
  FileUp,
  Hospital,
  LogOut,
  Trash2
} from 'lucide-react';
import { appointmentsApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'upcoming'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // New Modals State
  const [prescriptionModal, setPrescriptionModal] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [followUpModal, setFollowUpModal] = useState(null);
  const [dischargeModal, setDischargeModal] = useState(null);
  const [completingAppointment, setCompletingAppointment] = useState(null);

  // Form States
  const [prescriptionForm, setPrescriptionForm] = useState([{ medicine: '', dosage: '', timing: '1-0-1', days: 5, notes: 'After food' }]);
  const [notesForm, setNotesForm] = useState({ symptoms: '', diagnosis: '', observations: '', advice: '' });
  const [reportForm, setReportForm] = useState({ reportName: '', reportType: 'PDF', file: null });
  const [followUpForm, setFollowUpForm] = useState({ date: '', notes: '' });
  const [dischargeForm, setDischargeForm] = useState({ summary: '', finalAdvice: '', medicines: '', nextVisitRecommendation: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', slot: '' });

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

  useEffect(() => {
    const qFilter = searchParams.get('filter');
    if (qFilter) {
      setFilter(qFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (notesModal) {
      setNotesForm({
        symptoms: notesModal.consultationNotes?.symptoms || '',
        diagnosis: notesModal.consultationNotes?.diagnosis || '',
        observations: notesModal.consultationNotes?.observations || '',
        advice: notesModal.consultationNotes?.advice || ''
      });
    }
  }, [notesModal]);

  useEffect(() => {
    if (prescriptionModal) {
      if (prescriptionModal.prescriptions && prescriptionModal.prescriptions.length > 0) {
        setPrescriptionForm(prescriptionModal.prescriptions);
      } else {
        setPrescriptionForm([{ medicine: '', dosage: '', timing: '1-0-1', days: 5, notes: 'After food' }]);
      }
    }
  }, [prescriptionModal]);

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      let targetStatus = status;
      if (
        (user?.role === 'receptionist' || user?.role === 'admin') &&
        (status === 'booked' || status === 'confirmed' || status === 'checked_in' || status === 'waiting' || status === 'in_consultation' || status === 'draft_prepared')
      ) {
        if (extraData.prescriptions || extraData.consultationNotes || extraData.reports || extraData.followUp) {
          targetStatus = 'draft_prepared';
        }
      }
      await appointmentsApi.updateStatus(id, { status: targetStatus, ...extraData });
      if (status === 'completed' || status === 'discharged') {
        router.push('/dashboard/patients');
      } else {
        fetchAppointments();
      }
      // Close all modals
      setPrescriptionModal(null);
      setNotesModal(null);
      setReportModal(null);
      setFollowUpModal(null);
      setDischargeModal(null);
      setCompletingAppointment(null);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await doctorsApi.upload(formData);
      setReportForm({ ...reportForm, reportUrl: res.data.url, file: file });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (app.status === 'cancelled' && filter !== 'cancelled') return false;
    
    let matchesFilter = false;
    const appDate = new Date(app.date).toDateString();
    const today = new Date().toDateString();

    if (filter === 'upcoming') {
      matchesFilter = ['booked', 'confirmed'].includes(app.status);
    } else if (filter === 'today') {
      matchesFilter = appDate === today && ['booked', 'confirmed'].includes(app.status);
    } else {
      matchesFilter = app.status === filter;
    }
    const matchesSearch = 
      app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'checked_in': return 'text-cyan-600 bg-cyan-50 border-cyan-100';
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'prescription_added': return 'text-teal-600 bg-teal-50 border-teal-100';
      case 'follow_up': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'missed': return 'text-red-600 bg-red-50 border-red-100';
      case 'cancelled': return 'text-rose-800 bg-rose-100 border-rose-200';
      // Legacy support
      case 'registered': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'waiting': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'in_consultation': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Operations</h1>
          <p className="text-slate-400 mt-2 font-bold text-sm uppercase tracking-[0.1em]">
            {user?.role === 'doctor' ? 'Medical Consultation Desk' : 'Patient Management Center'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar">
            {['upcoming', 'today', 'checked_in', 'draft_prepared', 'follow_up', 'completed', 'missed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                  filter === f 
                    ? "bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                {f === 'missed' ? 'Missed Appointments' : 
                 f === 'follow_up' ? 'Follow-Up Visits' : 
                 f === 'draft_prepared' ? 'Draft Prepared' : 
                 f.replace('_', ' ')}
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
                placeholder="Search by patient name, ID, or condition..."
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
            <p className="text-xs font-bold text-blue-100 uppercase">Active Cases</p>
            <p className="text-2xl font-black">{filteredAppointments.length}</p>
          </div>
          <Activity size={32} className="text-blue-400 opacity-50" />
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-400 mt-4 font-bold">Synchronizing medical records...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No active appointments</h3>
            <p className="text-slate-500 mt-2 font-medium">There are no patient records matching your criteria.</p>
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
                  className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 group"
                >
                  <div className="p-1">
                    <div className="flex flex-col lg:flex-row lg:items-stretch">
                      {/* Date Block */}
                      <div className="lg:w-32 rounded-t-[2rem] lg:rounded-tr-none lg:rounded-l-[2rem] bg-slate-50/50 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-slate-100 group-hover:bg-blue-50/30 transition-colors">
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
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">{app.doctor?.specialty || 'Physician'}</p>
                              <p className="text-sm font-black text-slate-900 truncate">Dr. {app.doctor?.user?.name || 'Expert'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="lg:w-80 rounded-b-[2rem] lg:rounded-bl-none lg:rounded-r-[2rem] p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50/30 flex items-center justify-between lg:flex-col lg:justify-center lg:gap-4">
                        <div className={cn(
                          "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all",
                          getStatusColor(app.status)
                        )}>
                          {app.status.replace('_', ' ')}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewingAppointment(app)}
                            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                            title="Patient Profile"
                          >
                            <Eye size={20} />
                          </button>

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
                                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden"
                                >
                                  <div className="p-2">
                                    <MenuButton 
                                      icon={<Eye size={18} />} 
                                      label="View Patient Profile" 
                                      onClick={() => { setViewingAppointment(app); setActiveMenu(null); }} 
                                    />
                                    
                                    {user?.role === 'doctor' && (
                                      <>
                                        <MenuButton 
                                          icon={<ClipboardList size={18} />} 
                                          label="Add Diagnosis" 
                                          onClick={() => { setNotesModal(app); setActiveMenu(null); }} 
                                        />
                                        <MenuButton 
                                          icon={<Pill size={18} />} 
                                          label="Add Prescription" 
                                          onClick={() => { setPrescriptionModal(app); setActiveMenu(null); }} 
                                        />
                                        <MenuButton 
                                          icon={<FileUp size={18} />} 
                                          label="Upload Report" 
                                          onClick={() => { setReportModal(app); setActiveMenu(null); }} 
                                        />
                                        <MenuButton 
                                          icon={<Calendar size={18} />} 
                                          label="Schedule Follow-up" 
                                          onClick={() => { setFollowUpModal(app); setActiveMenu(null); }} 
                                        />
                                                                                 <MenuButton 
                                           icon={<Calendar size={18} />} 
                                           label="Reschedule Appointment" 
                                           onClick={() => {
                                             setReschedulingAppointment(app);
                                             setRescheduleData({ date: app.date.split('T')[0], slot: app.slot });
                                             setActiveMenu(null);
                                           }} 
                                         />
                                         <div className="h-px bg-slate-50 my-2" />
                                        <MenuButton 
                                          icon={<CheckCircle2 size={18} />} 
                                          label="Complete Consultation" 
                                          color="text-emerald-600"
                                          onClick={() => { setCompletingAppointment(app); setActiveMenu(null); }} 
                                        />
                                      </>
                                    )}

                                    {(user?.role === 'admin' || user?.role === 'receptionist') && (
                                      <>
                                        <MenuButton 
                                          icon={<Calendar size={18} />} 
                                          label="Reschedule Appointment" 
                                          onClick={() => {
                                            setReschedulingAppointment(app);
                                            setRescheduleData({ date: app.date.split('T')[0], slot: app.slot });
                                            setActiveMenu(null);
                                          }} 
                                        />
                                        <MenuButton 
                                          icon={<User size={18} />} 
                                          label="Check-In Patient" 
                                          color="text-cyan-600"
                                          onClick={() => handleStatusUpdate(app._id, 'checked_in')} 
                                        />
                                        {(app.clinic?.receptionAssistantMode === true || app.doctor?.clinic?.receptionAssistantMode === true || app.doctor?.branchId?.receptionAssistantMode === true) && (
                                          <>
                                            <div className="h-px bg-slate-50 my-1" />
                                            <MenuButton 
                                              icon={<ClipboardList size={18} />} 
                                              label="Draft Diagnosis" 
                                              onClick={() => { setNotesModal(app); setActiveMenu(null); }} 
                                            />
                                            <MenuButton 
                                              icon={<Pill size={18} />} 
                                              label="Draft Prescription" 
                                              onClick={() => { setPrescriptionModal(app); setActiveMenu(null); }} 
                                            />
                                            <MenuButton 
                                              icon={<FileUp size={18} />} 
                                              label="Upload Report" 
                                              onClick={() => { setReportModal(app); setActiveMenu(null); }} 
                                            />
                                            <MenuButton 
                                              icon={<Calendar size={18} />} 
                                              label="Schedule Follow-up" 
                                              onClick={() => { setFollowUpModal(app); setActiveMenu(null); }} 
                                            />
                                            <div className="h-px bg-slate-50 my-1" />
                                          </>
                                        )}
                                        <MenuButton 
                                          icon={<XCircle size={18} />} 
                                          label="Mark as Missed" 
                                          color="text-orange-600"
                                          onClick={() => handleStatusUpdate(app._id, 'missed')} 
                                        />
                                        <MenuButton 
                                          icon={<XCircle size={18} />} 
                                          label="Cancel Appointment" 
                                          color="text-red-600"
                                          onClick={() => handleStatusUpdate(app._id, 'cancelled')} 
                                        />
                                      </>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* MODALS */}

      {/* Prescription Modal */}
      <AnimatePresence>
        {prescriptionModal && (
          <Modal 
            title={((user?.role === 'receptionist' || user?.role === 'admin') && (prescriptionModal.clinic?.receptionAssistantMode === true || prescriptionModal.doctor?.clinic?.receptionAssistantMode === true || prescriptionModal.doctor?.branchId?.receptionAssistantMode === true)) ? "Prepare Draft Prescription" : "Add Prescription"} 
            icon={<Pill />} 
            onClose={() => setPrescriptionModal(null)}
          >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              {prescriptionForm.map((med, index) => (
                <div key={index} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative group/med">
                  {prescriptionForm.length > 1 && (
                    <button 
                      onClick={() => setPrescriptionForm(prescriptionForm.filter((_, i) => i !== index))}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Medicine Name</label>
                      <input 
                        type="text" 
                        value={med.medicine}
                        onChange={(e) => {
                          const newForm = [...prescriptionForm];
                          newForm[index].medicine = e.target.value;
                          setPrescriptionForm(newForm);
                        }}
                        className="w-full h-12 px-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-600 bg-white shadow-sm transition-all outline-none font-bold"
                        placeholder="e.g. Dolo 650"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Dosage</label>
                      <input 
                        type="text" 
                        value={med.dosage}
                        onChange={(e) => {
                          const newForm = [...prescriptionForm];
                          newForm[index].dosage = e.target.value;
                          setPrescriptionForm(newForm);
                        }}
                        className="w-full h-12 px-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-600 bg-white shadow-sm transition-all outline-none font-bold"
                        placeholder="e.g. 650mg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Timing</label>
                      <input 
                        type="text" 
                        value={med.timing}
                        onChange={(e) => {
                          const newForm = [...prescriptionForm];
                          newForm[index].timing = e.target.value;
                          setPrescriptionForm(newForm);
                        }}
                        className="w-full h-12 px-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-600 bg-white shadow-sm transition-all outline-none font-bold"
                        placeholder="e.g. 1-0-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Days</label>
                      <input 
                        type="number" 
                        value={med.days}
                        onChange={(e) => {
                          const newForm = [...prescriptionForm];
                          newForm[index].days = parseInt(e.target.value);
                          setPrescriptionForm(newForm);
                        }}
                        className="w-full h-12 px-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-600 bg-white shadow-sm transition-all outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Notes</label>
                      <input 
                        type="text" 
                        value={med.notes}
                        onChange={(e) => {
                          const newForm = [...prescriptionForm];
                          newForm[index].notes = e.target.value;
                          setPrescriptionForm(newForm);
                        }}
                        className="w-full h-12 px-4 rounded-xl border-2 border-transparent focus:bg-white focus:border-blue-600 bg-white shadow-sm transition-all outline-none font-bold"
                        placeholder="e.g. After food"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setPrescriptionForm([...prescriptionForm, { medicine: '', dosage: '', timing: '1-0-1', days: 5, notes: 'After food' }])}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Another Medicine
              </button>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setPrescriptionModal(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => handleStatusUpdate(prescriptionModal._id, prescriptionModal.status, { prescriptions: prescriptionForm })} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Save Prescription</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesModal && (
          <Modal 
            title={((user?.role === 'receptionist' || user?.role === 'admin') && (notesModal.clinic?.receptionAssistantMode === true || notesModal.doctor?.clinic?.receptionAssistantMode === true || notesModal.doctor?.branchId?.receptionAssistantMode === true)) ? "Prepare Draft Consultation Notes" : "Clinical Consultation Notes"} 
            icon={<ClipboardList />} 
            onClose={() => setNotesModal(null)}
          >
            <div className="space-y-4">
              <NoteField label="Symptoms" value={notesForm.symptoms} onChange={(v) => setNotesForm({...notesForm, symptoms: v})} placeholder="Describe patient symptoms..." />
              <NoteField label="Diagnosis" value={notesForm.diagnosis} onChange={(v) => setNotesForm({...notesForm, diagnosis: v})} placeholder="Enter medical diagnosis..." />
              <NoteField label="Observations" value={notesForm.observations} onChange={(v) => setNotesForm({...notesForm, observations: v})} placeholder="Enter physical observations..." />
              <NoteField label="Advice" value={notesForm.advice} onChange={(v) => setNotesForm({...notesForm, advice: v})} placeholder="Enter medical advice..." />
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setNotesModal(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => handleStatusUpdate(notesModal._id, notesModal.status, { consultationNotes: notesForm })} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Save Notes</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {reportModal && (
          <Modal title="Upload Medical Report" icon={<FileUp />} onClose={() => setReportModal(null)}>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Report Name</label>
                <input 
                  type="text" 
                  value={reportForm.reportName}
                  onChange={(e) => setReportForm({...reportForm, reportName: e.target.value})}
                  className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold"
                  placeholder="e.g. Blood Test Report"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Report Type</label>
                  <select 
                    value={reportForm.reportType}
                    onChange={(e) => setReportForm({...reportForm, reportType: e.target.value})}
                    className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold"
                  >
                    <option>PDF</option>
                    <option>X-ray</option>
                    <option>Blood Test</option>
                    <option>MRI</option>
                    <option>Scan</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Select File</label>
                  <label className="flex items-center justify-center w-full h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer hover:border-blue-600 transition-all group">
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600">{reportForm.file ? reportForm.file.name : 'Choose File'}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setReportModal(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => {
                const currentReports = reportModal.reports || [];
                handleStatusUpdate(reportModal._id, reportModal.status, { reports: [...currentReports, { ...reportForm, uploadedAt: new Date() }] });
              }} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Upload Report</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Follow-up Modal */}
      <AnimatePresence>
        {followUpModal && (
          <Modal title="Schedule Follow-up" icon={<Calendar />} onClose={() => setFollowUpModal(null)}>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Next Visit Date</label>
                <input 
                  type="date" 
                  value={followUpForm.date}
                  onChange={(e) => setFollowUpForm({...followUpForm, date: e.target.value})}
                  className="w-full h-14 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Follow-up Notes</label>
                <textarea 
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({...followUpForm, notes: e.target.value})}
                  className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold resize-none"
                  placeholder="e.g. Review blood test results"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setFollowUpModal(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => handleStatusUpdate(followUpModal._id, followUpModal.status, { followUp: followUpForm })} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Schedule</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Discharge Modal */}
      <AnimatePresence>
        {dischargeModal && (
          <Modal title="Discharge Summary" icon={<LogOut />} onClose={() => setDischargeModal(null)}>
            <div className="space-y-4">
              <NoteField label="Discharge Summary" value={dischargeForm.summary} onChange={(v) => setDischargeForm({...dischargeForm, summary: v})} placeholder="Summarize patient stay and treatment..." />
              <NoteField label="Final Advice" value={dischargeForm.finalAdvice} onChange={(v) => setDischargeForm({...dischargeForm, finalAdvice: v})} placeholder="Final advice for home care..." />
              <NoteField label="Medicines at Home" value={dischargeForm.medicines} onChange={(v) => setDischargeForm({...dischargeForm, medicines: v})} placeholder="List home medications..." />
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Next Visit Recommendation</label>
                <input 
                  type="text" 
                  value={dischargeForm.nextVisitRecommendation}
                  onChange={(e) => setDischargeForm({...dischargeForm, nextVisitRecommendation: e.target.value})}
                  className="w-full h-14 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold"
                  placeholder="e.g. Follow-up after 10 days"
                />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setDischargeModal(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => handleStatusUpdate(dischargeModal._id, 'discharged', { dischargeSummary: { ...dischargeForm, dischargedAt: new Date() } })} className="flex-[2] h-14 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200">Complete Discharge</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

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
                    {viewingAppointment.fullName?.charAt(0) || viewingAppointment.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none">{viewingAppointment.fullName || viewingAppointment.patient?.name}</h3>
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
                  {viewingAppointment.status.replace('_', ' ')}
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

                {/* Reason for Visit & Illness Message */}
                {viewingAppointment.reason && (
                  <div className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100">
                    <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <MessageSquare size={14} /> Reason for Visit / Message
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {viewingAppointment.reason}
                    </p>
                  </div>
                )}

                {/* Medical History Section (If available) */}
                {viewingAppointment.isHistorical && (
                  <div className="p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100">
                    <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <FileText size={14} /> Previous Records
                    </h4>
                    <div className="space-y-4 text-sm font-bold text-slate-700">
                      {viewingAppointment.diagnosis && <p><span className="text-emerald-600 opacity-70">Diagnosis:</span> {viewingAppointment.diagnosis}</p>}
                      {viewingAppointment.prescription && <p><span className="text-emerald-600 opacity-70">Prescription:</span> {viewingAppointment.prescription}</p>}
                    </div>
                  </div>
                )}

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
          <Modal title="Reschedule" icon={<Calendar />} onClose={() => setReschedulingAppointment(null)}>
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
              <button onClick={() => setReschedulingAppointment(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={handleReschedule} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Reschedule</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Complete Visit Modal */}
      <AnimatePresence>
        {completingAppointment && (
          <Modal title="Finalize Consultation" icon={<CheckCircle2 />} onClose={() => setCompletingAppointment(null)}>
            <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 mb-6">
              <p className="text-sm font-bold text-emerald-800">
                You are marking this visit as completed. This will move the patient record to the history collection.
              </p>
            </div>
            <NoteField label="Final Summary / Diagnosis" value={notesForm.diagnosis} onChange={(v) => setNotesForm({...notesForm, diagnosis: v})} placeholder="Enter final consultation diagnosis..." />
            <div className="mt-8 flex gap-4">
              <button onClick={() => setCompletingAppointment(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => handleStatusUpdate(completingAppointment._id, 'completed', { consultationNotes: notesForm })} className="flex-[2] h-14 rounded-2xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200">Finalize & Complete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components

function Modal({ title, icon, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 my-auto relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><XCircle size={24} /></button>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
            {icon}
          </div>
          <h3 className="text-2xl font-black text-slate-900">{title}</h3>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function NoteField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-24 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}

function MenuButton({ icon, label, onClick, color = "text-slate-700" }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold ${color} hover:bg-slate-50 rounded-xl transition-all`}
    >
      {icon}
      {label}
    </button>
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
