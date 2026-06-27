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
  ChevronLeft,
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
  Trash2,
  Play,
  Users
} from 'lucide-react';
import { appointmentsApi, doctorsApi, analyticsApi } from '@/lib/api';
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
  const [filter, setFilter] = useState('today'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Doctor workflow states
  const [todaySubFilter, setTodaySubFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAppType, setSelectedAppType] = useState('all');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);

  const tabsRef = React.useRef(null);
  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isAppointmentPast = (aptDateStr, slotStr) => {
    const aptDate = new Date(aptDateStr);
    const now = new Date();
    
    const aptDateOnly = new Date(aptDate);
    aptDateOnly.setHours(0, 0, 0, 0);
    const nowOnly = new Date(now);
    nowOnly.setHours(0, 0, 0, 0);
    
    if (aptDateOnly < nowOnly) {
      return true;
    }
    if (aptDateOnly > nowOnly) {
      return false;
    }
    
    try {
      const timePart = slotStr.split("-")[1]?.trim() || slotStr.split("-")[0]?.trim() || "";
      const matches = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (matches) {
        let hours = parseInt(matches[1], 10);
        const minutes = parseInt(matches[2], 10);
        const ampm = matches[3];
        if (ampm) {
          if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
          if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
        }
        const slotTime = new Date(now);
        slotTime.setHours(hours, minutes, 0, 0);
        return now > slotTime;
      }
    } catch (e) {
      console.error("Error parsing slot time", e);
    }
    
    return aptDate < now;
  };

  const getEffectiveStatus = (apt) => {
    return apt.status?.toLowerCase() || 'booked';
  };

  // New states for quick filters
  const [quickFilter, setQuickFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const getRoleTabs = useCallback(() => {
    const role = user?.role || 'receptionist';
    if (role === 'doctor') {
      return [
        { id: 'today', label: 'Today' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' },
        { id: 'patient_missed', label: 'Patient Missed' },
        { id: 'cancelled', label: 'Cancelled' }
      ];
    } else if (role === 'admin') {
      return [
        { id: 'all', label: 'All Appointments' },
        { id: 'today', label: 'Today' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'patient_missed', label: 'Patient Missed' },
        { id: 'reports', label: 'Reports' }
      ];
    } else {
      return [
        { id: 'today', label: 'Today' },
        { id: 'booked', label: 'Booked' },
        { id: 'checked_in', label: 'Checked In' },
        { id: 'waiting', label: 'Waiting Queue' },
        { id: 'completed', label: 'Completed' },
        { id: 'patient_missed', label: 'Patient Missed' },
        { id: 'cancelled', label: 'Cancelled' }
      ];
    }
  }, [user]);

  const tabs = getRoleTabs();

  // Reset default filter tab based on role when user loads
  useEffect(() => {
    if (user?.role) {
      const defaultTab = getRoleTabs()[0]?.id || 'today';
      setFilter(searchParams.get('filter') || defaultTab);
    }
  }, [user, getRoleTabs, searchParams]);

  // Extract unique doctors and specialties dynamically for filters
  const uniqueDoctors = Array.from(new Set(appointments.map(a => a.doctor?._id).filter(Boolean)))
    .map(id => appointments.find(a => a.doctor?._id === id)?.doctor);
  const uniqueSpecialties = Array.from(new Set(appointments.map(a => a.doctor?.specialty).filter(Boolean)));

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
    try {
      analyticsApi.markNotified('appointments').catch(err => console.error(err));
    } catch (err) {
      console.error(err);
    }
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
      const currentApp = appointments.find(a => a._id === id);
      const isTransitioning = currentApp && currentApp.status !== status;
      
      // Merge current local state if complete transition is being called
      let mergedData = { ...extraData };
      if (status === 'in_consultation' && !currentApp.consultationStartedAt) {
        mergedData.consultationStartedAt = new Date();
      }

      await appointmentsApi.updateStatus(id, { status, ...mergedData });
      
      if (user?.role !== 'doctor' && isTransitioning && (status === 'completed' || status === 'follow_up')) {
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

  const handleCallNextPatient = async () => {
    try {
      setLoading(true);
      await appointmentsApi.callNext();
      fetchAppointments();
      alert('Next patient called successfully.');
    } catch (err) {
      alert(err.message || 'Failed to call next patient');
    } finally {
      setLoading(false);
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

  const getTabCount = (tabId) => {
    return appointments.filter(app => {
      const status = app.status?.toLowerCase();
      const appDate = new Date(app.date).toDateString();
      const today = new Date().toDateString();
      
      if (user?.role === 'doctor') {
        if (tabId === 'today') {
          return appDate === today && status !== 'cancelled';
        }
        if (tabId === 'upcoming') {
          const appDateTime = new Date(app.date);
          const todayDateObj = new Date();
          todayDateObj.setHours(0,0,0,0);
          return appDateTime >= todayDateObj && appDate !== today && status !== 'cancelled' && status !== 'completed' && status !== 'visited';
        }
        if (tabId === 'completed') {
          return status === 'completed' || status === 'visited' || status === 'follow_up';
        }
        if (tabId === 'patient_missed') {
          return status === 'patient_missed';
        }
        if (tabId === 'cancelled') {
          return status === 'cancelled';
        }
        return false;
      }

      if (tabId === 'all') return true;
      if (tabId === 'today') return appDate === today;
      if (tabId === 'reports') return true;
      return status === tabId;
    }).length;
  };

  const filteredAppointments = appointments.filter(app => {
    const status = getEffectiveStatus(app);
    const appDate = new Date(app.date).toDateString();
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toDateString();

    let matchesFilter = false;

    if (user?.role === 'doctor') {
      if (filter === 'today') {
        matchesFilter = (appDate === today) && (status !== 'cancelled');
        if (matchesFilter) {
          if (todaySubFilter === 'checked_in') {
            matchesFilter = status === 'checked_in';
          } else if (todaySubFilter === 'in_consultation') {
            matchesFilter = status === 'in_consultation';
          } else if (todaySubFilter === 'completed') {
            matchesFilter = (status === 'completed' || status === 'visited' || status === 'follow_up');
          }
        }
      } else if (filter === 'upcoming') {
        const appDateTime = new Date(app.date);
        const todayDateObj = new Date();
        todayDateObj.setHours(0,0,0,0);
        matchesFilter = (appDateTime >= todayDateObj && appDate !== today) && (status !== 'cancelled' && status !== 'completed' && status !== 'visited');
      } else if (filter === 'completed') {
        matchesFilter = (status === 'completed' || status === 'visited' || status === 'follow_up');
      } else if (filter === 'patient_missed') {
        matchesFilter = (status === 'patient_missed');
      } else if (filter === 'cancelled') {
        matchesFilter = (status === 'cancelled');
      }
    } else {
      if (filter === 'all') {
        matchesFilter = true;
      } else if (filter === 'today') {
        matchesFilter = appDate === today;
      } else if (filter === 'reports') {
        matchesFilter = true;
      } else {
        matchesFilter = status === filter;
      }
    }

    // Quick Filters (Today, Tomorrow, This Week, Doctor, Department/Specialty, Status)
    let matchesQuickFilter = true;
    if (user?.role !== 'doctor') {
      if (quickFilter === 'today') {
        matchesQuickFilter = appDate === today;
      } else if (quickFilter === 'tomorrow') {
        matchesQuickFilter = appDate === tomorrowString;
      } else if (quickFilter === 'week') {
        const dateVal = new Date(app.date);
        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);
        matchesQuickFilter = dateVal >= now && dateVal <= oneWeekFromNow;
      }

      if (selectedDoctor !== 'all' && app.doctor?._id !== selectedDoctor) {
        matchesQuickFilter = false;
      }
      if (selectedSpecialty !== 'all' && app.doctor?.specialty?.toLowerCase() !== selectedSpecialty.toLowerCase()) {
        matchesQuickFilter = false;
      }
      if (selectedStatus !== 'all' && status !== selectedStatus.toLowerCase()) {
        matchesQuickFilter = false;
      }
    } else {
      // Doctor priority/type/status overrides
      if (selectedStatus !== 'all' && status !== selectedStatus.toLowerCase()) {
        matchesQuickFilter = false;
      }
      const isEmergency = app.reason?.toLowerCase().includes('emergency') || app.reason?.toLowerCase().includes('urgent') || app.priority === 'high' || app.isEmergency;
      if (selectedPriority === 'emergency' && !isEmergency) {
        matchesQuickFilter = false;
      } else if (selectedPriority === 'normal' && isEmergency) {
        matchesQuickFilter = false;
      }
      if (selectedAppType !== 'all') {
        const type = app.appointmentType || 'Consultation';
        if (type.toLowerCase() !== selectedAppType.toLowerCase()) {
          matchesQuickFilter = false;
        }
      }
    }

    const matchesSearch = 
      app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm) ||
      app._id?.toString().includes(searchTerm) ||
      app.id?.toString().includes(searchTerm) ||
      app.tokenNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.uhid && app.uhid.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesQuickFilter && matchesSearch;
  });

  const canEditAppointmentDetails = (app) => {
    if (!app) return false;
    if (app.status === 'in_consultation') return true;
    if (['completed', 'follow_up'].includes(app.status)) {
      const completedTime = app.consultationCompletedAt || app.updatedAt || app.date;
      const elapsedMs = new Date() - new Date(completedTime);
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      return elapsedHours < 1;
    }
    return false;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'checked_in': return 'text-cyan-600 bg-cyan-50 border-cyan-100';
      case 'waiting': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'in_consultation': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'follow_up': return 'text-teal-600 bg-teal-50 border-teal-100';
      case 'patient_missed': return 'text-red-600 bg-red-50 border-red-100';
      case 'cancelled': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getWaitingDuration = (app) => {
    const since = app.waitingSince || app.checkedInAt || app.checkInTime || app.updatedAt;
    if (!since) return '0 min';
    const diffMs = new Date() - new Date(since);
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    return `${diffMins} min`;
  };

  const getAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sticky Header & Controls Wrapper */}
      <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur-sm pb-4 pt-2 -mx-4 px-4 xl:-mx-8 xl:px-8 space-y-4 border-b border-slate-100">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight whitespace-nowrap">Clinical Operations</h1>
            <p className="text-slate-400 mt-1 font-bold text-xs uppercase tracking-[0.1em]">
              {user?.role === 'doctor' ? 'Medical Consultation Desk' : user?.role === 'admin' ? 'Clinic Administration Desk' : 'Front Desk Queue'}
            </p>
          </div>
          <div className="w-full xl:w-auto flex items-center gap-2 overflow-hidden">
            <button 
              onClick={() => scroll('left')}
              className="w-7 h-7 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
              title="Scroll Left"
            >
              <ChevronLeft size={14} />
            </button>

            <div 
              ref={tabsRef}
              className="flex-1 bg-slate-100/50 p-1 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                    filter === tab.id 
                      ? "bg-white text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-[1.02]" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  )}
                >
                  {tab.label} ({getTabCount(tab.id)})
                </button>
              ))}
            </div>

            <button 
              onClick={() => scroll('right')}
              className="w-7 h-7 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
              title="Scroll Right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Doctor Nested Sub-Filters for Today */}
        {user?.role === 'doctor' && filter === 'today' && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {['all', 'checked_in', 'completed'].map((sub) => {
              const label = sub === 'all' ? 'All' : sub === 'checked_in' ? 'Checked-In' : 'Completed Today';
              return (
                <button
                  key={sub}
                  onClick={() => setTodaySubFilter(sub)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                    todaySubFilter === sub 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="relative flex-1 group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by patient name, mobile, appointment ID, token or UHID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-11 pr-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-11 w-11 flex items-center justify-center rounded-2xl border transition-all",
                    showFilters ? "bg-slate-900 border-slate-900 text-white" : "border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                  title="Filters"
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>
            
            {user?.role !== 'doctor' && (
              <div className="bg-blue-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-lg shadow-blue-100/50">
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Active Cases</p>
                  <p className="text-xl font-black">{filteredAppointments.length}</p>
                </div>
                <Activity size={24} className="text-blue-400 opacity-50" />
              </div>
            )}
            
            {user?.role === 'doctor' && (
              <div className="bg-blue-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-lg shadow-blue-100/50">
                <div>
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">List Count</p>
                  <p className="text-xl font-black">{filteredAppointments.length}</p>
                </div>
                <Activity size={24} className="text-blue-400 opacity-50" />
              </div>
            )}
          </div>

          {/* Collapsible Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                  {user?.role !== 'doctor' ? (
                    <>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Date Range</label>
                        <select 
                          value={quickFilter} 
                          onChange={(e) => setQuickFilter(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 border-2 transition-all outline-none font-bold text-xs"
                        >
                          <option value="all">All Dates</option>
                          <option value="today">Today Only</option>
                          <option value="tomorrow">Tomorrow Only</option>
                          <option value="week">This Week</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Doctor</label>
                        <select 
                          value={selectedDoctor} 
                          onChange={(e) => setSelectedDoctor(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 border-2 transition-all outline-none font-bold text-xs"
                        >
                          <option value="all">All Doctors</option>
                          {uniqueDoctors.map(doc => (
                            <option key={doc?._id} value={doc?._id}>Dr. {doc?.user?.name || 'Expert'}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Specialty</label>
                        <select 
                          value={selectedSpecialty} 
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 border-2 transition-all outline-none font-bold text-xs"
                        >
                          <option value="all">All Specialties</option>
                          {uniqueSpecialties.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Priority</label>
                        <select 
                          value={selectedPriority} 
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 border-2 transition-all outline-none font-bold text-xs"
                        >
                          <option value="all">All Priorities</option>
                          <option value="emergency">Emergency / Urgent</option>
                          <option value="normal">Normal</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Appointment Type</label>
                        <select 
                          value={selectedAppType} 
                          onChange={(e) => setSelectedAppType(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 border-2 transition-all outline-none font-bold text-xs"
                        >
                          <option value="all">All Types</option>
                          <option value="In-Person">In-Person</option>
                          <option value="Telehealth">Telehealth</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status Override</label>
                    <select 
                      value={selectedStatus} 
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 border-2 transition-all outline-none font-bold text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="booked">Booked</option>
                      <option value="checked_in">Checked In</option>
                      <option value="waiting">Waiting</option>
                      <option value="completed">Completed</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="patient_missed">Patient Missed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              {filteredAppointments.map((app) => {
                const status = getEffectiveStatus(app);
                const isEmergency = app.reason?.toLowerCase().includes('emergency') || app.reason?.toLowerCase().includes('urgent') || app.priority === 'high' || app.isEmergency;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={app._id}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 group"
                  >
                    <div className="p-0.5">
                      <div className="flex flex-col lg:flex-row lg:items-stretch">
                        {/* Time & Token Block */}
                        <div className="lg:w-28 rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl bg-slate-50/50 flex flex-col items-center justify-center p-3 border-b lg:border-b-0 lg:border-r border-slate-100 group-hover:bg-blue-50/30 transition-colors shrink-0">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{app.slot}</p>
                          {isEmergency && (
                            <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-100 text-red-700 animate-pulse uppercase tracking-wider">
                              EMERGENCY
                            </span>
                          )}
                        </div>

                        {/* Main Patient Metadata Area */}
                        <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-slate-900">{app.fullName || app.patient?.name}</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 pt-1.5 text-xs text-slate-500 font-semibold">
                              <div><span className="text-slate-400">Age/Gender:</span> {getAge(app.dob)} yrs / {app.gender}</div>
                              <div><span className="text-slate-400">Phone:</span> {app.phone}</div>
                              <div><span className="text-slate-400">Type:</span> {app.appointmentType || 'In-Person'}</div>
                              <div><span className="text-slate-400">Doctor:</span> Dr. {app.doctor?.user?.name || 'Expert'}</div>
                            </div>

                            {app.reason && (
                              <div className="mt-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <span className="font-extrabold text-slate-700">Chief Complaint:</span> {app.reason}
                              </div>
                            )}

                            {/* Check-In Details */}
                            {['checked_in', 'in_consultation', 'completed'].includes(status) && (
                              <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <div>Check-in: {app.checkedInAt || app.checkInTime ? new Date(app.checkedInAt || app.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                                {status === 'checked_in' && (
                                  <div className="text-cyan-600">Waiting: {getWaitingDuration(app)}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions Area */}
                        <div className="lg:w-56 rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl p-4 border-t lg:border-t-0 lg:border-l border-slate-100 bg-slate-50/30 flex items-center justify-between lg:flex-col lg:justify-center lg:gap-3 shrink-0">
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all",
                            getStatusColor(status)
                          )}>
                            {status.replace('_', ' ')}
                          </div>

                          {/* Contextual Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 justify-center mt-2 w-full">
                            {user?.role === 'doctor' ? (
                              <>
                                <div className="flex items-center gap-1.5 justify-end w-full">
                                  {status === 'checked_in' && (
                                    <button
                                      onClick={() => handleStatusUpdate(app._id, 'in_consultation')}
                                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-black text-xs shadow-sm flex items-center justify-center gap-1"
                                    >
                                      Start Consultation
                                    </button>
                                  )}

                                  {status === 'in_consultation' && (
                                    <button
                                      onClick={() => {
                                        setCompletingAppointment(app);
                                        setNotesForm(app.consultationNotes || { symptoms: '', diagnosis: '', observations: '', advice: '' });
                                      }}
                                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-black text-xs shadow-sm flex items-center justify-center gap-1"
                                    >
                                      Complete Consultation
                                    </button>
                                  )}

                                  <div className="relative">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === app._id ? null : app._id);
                                      }}
                                      className={cn(
                                        "w-8 h-8 rounded-xl transition-all border flex items-center justify-center bg-white text-slate-400 border-slate-200 hover:bg-slate-50",
                                        activeMenu === app._id ? "bg-slate-900 text-white border-slate-900 shadow-lg" : ""
                                      )}
                                    >
                                      <MoreVertical size={15} />
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
                                              {status === 'checked_in' && (
                                                <MenuButton 
                                                  icon={<Play size={18} />} 
                                                  label="Start Consultation" 
                                                  onClick={() => { handleStatusUpdate(app._id, 'in_consultation'); setActiveMenu(null); }} 
                                                />
                                              )}

                                              {status === 'in_consultation' && (
                                                <>
                                                  <MenuButton 
                                                    icon={<FileText size={18} />} 
                                                    label={app.consultationNotes ? 'Continue Consultation' : 'Diagnosis / Notes'} 
                                                    onClick={() => {
                                                      setNotesModal(app);
                                                      setNotesForm(app.consultationNotes || { symptoms: '', diagnosis: '', observations: '', advice: '' });
                                                      setActiveMenu(null);
                                                    }} 
                                                  />
                                                  <MenuButton 
                                                    icon={<Pill size={18} />} 
                                                    label="Prescription" 
                                                    onClick={() => {
                                                      setPrescriptionModal(app);
                                                      setPrescriptionForm(app.prescriptions?.length > 0 ? app.prescriptions : [{ medicine: '', dosage: '', timing: '1-0-1', days: 5, notes: 'After food' }]);
                                                      setActiveMenu(null);
                                                    }} 
                                                  />
                                                  <MenuButton 
                                                    icon={<CheckCircle2 size={18} />} 
                                                    label="Complete Consultation" 
                                                    color="text-emerald-650"
                                                    onClick={() => {
                                                      setCompletingAppointment(app);
                                                      setNotesForm(app.consultationNotes || { symptoms: '', diagnosis: '', observations: '', advice: '' });
                                                      setActiveMenu(null);
                                                    }} 
                                                  />
                                                </>
                                              )}

                                              {(status === 'completed' || status === 'visited' || status === 'follow_up') && (
                                                <>
                                                  <MenuButton 
                                                    icon={<Eye size={18} />} 
                                                    label="View Summary" 
                                                    onClick={() => { setViewingAppointment(app); setActiveMenu(null); }} 
                                                  />
                                                  <MenuButton 
                                                    icon={<FileText size={18} />} 
                                                    label="Print Prescription" 
                                                    onClick={() => { alert("Simulating Print Prescription..."); setActiveMenu(null); }} 
                                                  />
                                                  <MenuButton 
                                                    icon={<MessageSquare size={18} />} 
                                                    label="Share Prescription" 
                                                    onClick={() => { alert("Prescription Shared successfully via WhatsApp / SMS"); setActiveMenu(null); }} 
                                                  />
                                                  <MenuButton 
                                                    icon={<CalendarCheck size={18} />} 
                                                    label="Schedule Follow-Up" 
                                                    color="text-blue-600"
                                                    onClick={() => {
                                                      setFollowUpModal(app);
                                                      setFollowUpForm({ date: '', notes: '' });
                                                      setActiveMenu(null);
                                                    }} 
                                                  />
                                                </>
                                              )}

                                              {status === 'cancelled' && (
                                                <MenuButton 
                                                  icon={<Eye size={18} />} 
                                                  label="View Details" 
                                                  onClick={() => { setViewingAppointment(app); setActiveMenu(null); }} 
                                                />
                                              )}
                                            </div>
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </>
                            ) : (
                              // Other roles default buttons
                              <>
                                <button 
                                  onClick={() => setViewingAppointment(app)}
                                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                                  title="Patient Profile"
                                >
                                  <Eye size={15} />
                                </button>
                                <div className="relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenu(activeMenu === app._id ? null : app._id);
                                    }}
                                    className={cn(
                                      "w-8 h-8 rounded-xl transition-all border flex items-center justify-center",
                                      activeMenu === app._id ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                                    )}
                                  >
                                    <MoreVertical size={15} />
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
                                            {(user?.role === 'admin' || user?.role === 'receptionist') && (
                                              <>
                                                {['booked', 'checked_in', 'waiting'].includes(status) && (
                                                  <MenuButton 
                                                    icon={<Calendar size={18} />} 
                                                    label="Reschedule Appointment" 
                                                    onClick={() => {
                                                      setReschedulingAppointment(app);
                                                      setRescheduleData({ date: app.date.split('T')[0], slot: app.slot });
                                                      setActiveMenu(null);
                                                    }} 
                                                  />
                                                )}
                                                {status === 'booked' && (
                                                  <>
                                                    <MenuButton 
                                                      icon={<User size={18} />} 
                                                      label="Check-In Patient" 
                                                      color="text-cyan-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'checked_in')} 
                                                    />
                                                    <MenuButton 
                                                      icon={<CheckCircle2 size={18} />} 
                                                      label="Move to Waiting Queue" 
                                                      color="text-amber-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'waiting')} 
                                                    />
                                                    <MenuButton 
                                                      icon={<XCircle size={18} />} 
                                                      label="Mark Patient Missed" 
                                                      color="text-orange-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'patient_missed')} 
                                                    />
                                                    <MenuButton 
                                                      icon={<XCircle size={18} />} 
                                                      label="Cancel Appointment" 
                                                      color="text-red-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'cancelled')} 
                                                    />
                                                  </>
                                                )}
                                                {status === 'checked_in' && (
                                                  <>
                                                    <MenuButton 
                                                      icon={<CheckCircle2 size={18} />} 
                                                      label="Move to Waiting Queue" 
                                                      color="text-cyan-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'waiting')} 
                                                    />
                                                    <MenuButton 
                                                      icon={<XCircle size={18} />} 
                                                      label="Mark Patient Missed" 
                                                      color="text-orange-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'patient_missed')} 
                                                    />
                                                    <MenuButton 
                                                      icon={<XCircle size={18} />} 
                                                      label="Cancel Appointment" 
                                                      color="text-red-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'cancelled')} 
                                                    />
                                                  </>
                                                )}
                                                {status === 'waiting' && (
                                                  <>
                                                    <MenuButton 
                                                      icon={<CheckCircle2 size={18} />} 
                                                      label="Check-In Patient" 
                                                      color="text-cyan-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'checked_in')} 
                                                    />
                                                    <MenuButton 
                                                      icon={<XCircle size={18} />} 
                                                      label="Cancel Appointment" 
                                                      color="text-red-600"
                                                      onClick={() => handleStatusUpdate(app._id, 'cancelled')} 
                                                    />
                                                  </>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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

                {/* Current Consultation Notes */}
                {(viewingAppointment.consultationNotes || canEditAppointmentDetails(viewingAppointment)) && (
                  <div className="p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100 relative group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ClipboardList size={14} /> Consultation Notes
                      </h4>
                      {canEditAppointmentDetails(viewingAppointment) && (
                        <button 
                          onClick={() => {
                            setNotesModal(viewingAppointment);
                            setNotesForm(viewingAppointment.consultationNotes || { symptoms: '', diagnosis: '', observations: '', advice: '' });
                            setViewingAppointment(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shadow-blue-100"
                        >
                          {viewingAppointment.consultationNotes ? 'Edit Notes' : 'Add Notes'}
                        </button>
                      )}
                    </div>
                    {viewingAppointment.consultationNotes ? (
                      <div className="space-y-3 text-sm font-bold text-slate-700">
                        {viewingAppointment.consultationNotes.symptoms && (
                          <p><span className="text-blue-600 opacity-70 block text-[10px] uppercase tracking-wider mb-0.5">Symptoms</span> {viewingAppointment.consultationNotes.symptoms}</p>
                        )}
                        {viewingAppointment.consultationNotes.diagnosis && (
                          <p><span className="text-blue-600 opacity-70 block text-[10px] uppercase tracking-wider mb-0.5">Diagnosis</span> {viewingAppointment.consultationNotes.diagnosis}</p>
                        )}
                        {viewingAppointment.consultationNotes.observations && (
                          <p><span className="text-blue-600 opacity-70 block text-[10px] uppercase tracking-wider mb-0.5">Observations</span> {viewingAppointment.consultationNotes.observations}</p>
                        )}
                        {viewingAppointment.consultationNotes.advice && (
                          <p><span className="text-blue-600 opacity-70 block text-[10px] uppercase tracking-wider mb-0.5">Advice</span> {viewingAppointment.consultationNotes.advice}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic">No consultation notes added yet.</p>
                    )}
                  </div>
                )}

                {/* Prescriptions */}
                {(viewingAppointment.prescriptions?.length > 0 || canEditAppointmentDetails(viewingAppointment)) && (
                  <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 relative group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Pill size={14} /> Prescribed Medicines
                      </h4>
                      {canEditAppointmentDetails(viewingAppointment) && (
                        <button 
                          onClick={() => {
                            setPrescriptionModal(viewingAppointment);
                            setPrescriptionForm(viewingAppointment.prescriptions?.length > 0 ? viewingAppointment.prescriptions : [{ medicine: '', dosage: '', timing: '1-0-1', days: 5, notes: 'After food' }]);
                            setViewingAppointment(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shadow-indigo-100"
                        >
                          {viewingAppointment.prescriptions?.length > 0 ? 'Edit Prescription' : 'Create Prescription'}
                        </button>
                      )}
                    </div>
                    {viewingAppointment.prescriptions?.length > 0 ? (
                      <div className="space-y-4">
                        {viewingAppointment.prescriptions.map((med, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-white border border-indigo-50 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-black text-slate-900">{med.medicine}</p>
                              <p className="text-xs text-slate-500 font-bold mt-0.5">{med.dosage} • {med.timing} • {med.days} Days</p>
                            </div>
                            {med.notes && (
                              <div className="text-xs bg-slate-50 px-3 py-1.5 rounded-lg text-slate-600 font-bold border border-slate-100">
                                {med.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic">No prescription created yet.</p>
                    )}
                  </div>
                )}

                {/* Uploaded Reports */}
                {(viewingAppointment.reports?.length > 0 || canEditAppointmentDetails(viewingAppointment)) && (
                  <div className="p-6 rounded-[2rem] bg-purple-50/50 border border-purple-100 relative group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileUp size={14} /> Uploaded Medical Reports
                      </h4>
                      {canEditAppointmentDetails(viewingAppointment) && (
                        <button 
                          onClick={() => {
                            setReportModal(viewingAppointment);
                            setViewingAppointment(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shadow-purple-100"
                        >
                          Upload Report
                        </button>
                      )}
                    </div>
                    {viewingAppointment.reports?.length > 0 ? (
                      <div className="space-y-3">
                        {viewingAppointment.reports.map((rep, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-white border border-purple-50 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-black text-slate-900">{rep.reportName}</p>
                              <p className="text-[10px] text-purple-500 font-black uppercase tracking-wider mt-0.5">{rep.reportType}</p>
                            </div>
                            {rep.reportUrl && (
                              <a 
                                href={getFullImageUrl(rep.reportUrl)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md shadow-purple-100 hover:bg-purple-700 transition-all"
                              >
                                View Report
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic">No reports uploaded yet.</p>
                    )}
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
            
            <div className="space-y-4">
              <NoteField 
                label="Final Summary / Diagnosis (Required)" 
                value={notesForm.diagnosis} 
                onChange={(v) => setNotesForm({...notesForm, diagnosis: v})} 
                placeholder="Enter final consultation diagnosis..." 
              />

              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={scheduleFollowUp} 
                    onChange={(e) => setScheduleFollowUp(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Schedule a Follow-Up Visit</span>
                </label>

                {scheduleFollowUp && (
                  <div className="space-y-3 animate-in fade-in duration-300 pt-2">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Follow-up Date</label>
                      <input 
                        type="date" 
                        value={followUpForm.date}
                        onChange={(e) => setFollowUpForm({...followUpForm, date: e.target.value})}
                        className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-blue-600 transition-all outline-none font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Follow-up Instructions</label>
                      <input 
                        type="text" 
                        value={followUpForm.notes}
                        onChange={(e) => setFollowUpForm({...followUpForm, notes: e.target.value})}
                        placeholder="e.g. Check blood sugar levels"
                        className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-blue-600 transition-all outline-none font-semibold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => {
                  setCompletingAppointment(null);
                  setScheduleFollowUp(false);
                  setFollowUpForm({ date: '', notes: '' });
                }} 
                className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!notesForm.diagnosis || !notesForm.diagnosis.trim()) {
                    alert("Diagnosis is required to complete the consultation.");
                    return;
                  }
                  
                  const extraData = {
                    consultationNotes: notesForm
                  };

                  if (scheduleFollowUp && followUpForm.date) {
                    extraData.followUp = {
                      date: followUpForm.date,
                      notes: followUpForm.notes
                    };
                  }

                  await handleStatusUpdate(completingAppointment._id, 'completed', extraData);
                  setScheduleFollowUp(false);
                  setFollowUpForm({ date: '', notes: '' });
                }} 
                className="flex-[2] h-14 rounded-2xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200"
              >
                Finalize & Complete
              </button>
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
