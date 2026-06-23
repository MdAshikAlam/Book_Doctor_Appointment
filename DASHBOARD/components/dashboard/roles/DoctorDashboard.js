"use client"

import React, { useState, useEffect } from 'react';
import { 
  Users, CalendarCheck, CheckCircle2, Clock, 
  Play, ClipboardList, Upload, CheckCircle, 
  PlusCircle, FilePlus, LogOut, ArrowRight,
  TrendingUp, Award, Activity, Search, Filter,
  Phone, UserCheck, Stethoscope, Video, MessageSquare,
  AlertCircle, ChevronRight, Eye, Calendar, CalendarDays,
  FileText, ShieldAlert, Plus, RefreshCw, X, Download,
  Building, Hospital, Briefcase, Sparkles, Printer
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Chart from '../Chart';
import CalendarWidget from '../CalendarWidget';

// Initial Mock Patients list with rich metadata for queue workflow
const initialPatients = [
  { id: '1', token: 'T-101', name: 'Sarah Johnson', age: 28, gender: 'Female', phone: '+1 (555) 019-2834', type: 'In-Person', reason: 'Chronic migraine follow-up', waitTime: '12 min', status: 'waiting', checkedInTime: '08:45 AM', queuePosition: 1, history: [
    { date: '2026-05-10', doctor: 'Dr. Arundhati Sharma', diagnosis: 'Tension Headache', prescription: 'Sumatriptan 50mg, Ibuprofen 400mg', notes: 'Advised lifestyle changes and hydration.' }
  ]},
  { id: '2', token: 'T-102', name: 'Robert Wilson', age: 45, gender: 'Male', phone: '+1 (555) 023-9988', type: 'Telehealth', reason: 'Post-op cardiac bypass check', waitTime: '25 min', status: 'checked_in', checkedInTime: '09:00 AM', queuePosition: 2, history: [
    { date: '2026-04-12', doctor: 'Dr. Arundhati Sharma', diagnosis: 'CABG Recovery', prescription: 'Aspirin 81mg, Metoprolol 25mg', notes: 'Vitals stable. Heart rate within target range.' }
  ]},
  { id: '3', token: 'T-103', name: 'Maria Garcia', age: 34, gender: 'Female', phone: '+1 (555) 045-8122', type: 'In-Person', reason: 'Thyroid panel consultation', waitTime: '3 min', status: 'in_consultation', checkedInTime: '09:15 AM', queuePosition: 3, history: [] },
  { id: '4', token: 'T-104', name: 'David Smith', age: 52, gender: 'Male', phone: '+1 (555) 089-1122', type: 'In-Person', reason: 'Type 2 Diabetes routine check', waitTime: '0 min', status: 'follow_up', checkedInTime: '09:30 AM', queuePosition: 4, history: [
    { date: '2026-03-01', doctor: 'Dr. Arundhati Sharma', diagnosis: 'Type 2 Diabetes', prescription: 'Metformin 500mg, Atorvastatin 10mg', notes: 'Hba1c was 7.2. Aiming to get it below 6.8.' }
  ]},
  { id: '5', token: 'T-105', name: 'Aaliyah Jackson', age: 60, gender: 'Female', phone: '+1 (555) 034-7711', type: 'Telehealth', reason: 'Chronic fatigue evaluation', waitTime: '0 min', status: 'completed', checkedInTime: '08:15 AM', queuePosition: 0, history: [] }
];

// Prescriptive Templates
const prescriptionTemplates = {
  'Common Cold': [
    { medicine: 'Paracetamol 650mg', dosage: '1 tablet', timing: '1-0-1', days: 5, notes: 'After food, if fever persists' },
    { medicine: 'Cetirizine 10mg', dosage: '1 tablet', timing: '0-0-1', days: 5, notes: 'At bedtime' },
    { medicine: 'Cough Syrup (Levosalbutamol)', dosage: '5ml', timing: '1-1-1', days: 3, notes: 'Warm water gargle recommended' }
  ],
  'Hypertension': [
    { medicine: 'Amlodipine 5mg', dosage: '1 tablet', timing: '1-0-0', days: 30, notes: 'Empty stomach in the morning' },
    { medicine: 'Telmisartan 40mg', dosage: '1 tablet', timing: '0-0-1', days: 30, notes: 'Monitor BP weekly' }
  ],
  'Diabetes Follow-up': [
    { medicine: 'Metformin 500mg SR', dosage: '1 tablet', timing: '1-0-1', days: 30, notes: 'With breakfast and dinner' },
    { medicine: 'Glimepiride 1mg', dosage: '1 tablet', timing: '1-0-0', days: 30, notes: 'Before breakfast' }
  ]
};

export default function DoctorDashboard({ data, selectedDate, onDateSelect }) {
  // States
  const [environment, setEnvironment] = useState('single'); // 'single', 'multi', 'hospital'
  const [patients, setPatients] = useState(initialPatients);
  const [activeWorkflowStage, setActiveWorkflowStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Drawer States
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState(null);
  const [activeTimelineTab, setActiveTimelineTab] = useState('visits');
  const [prescriptionWriterPatient, setPrescriptionWriterPatient] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ medicine: '', dosage: '1 tablet', timing: '1-0-1', days: 5, notes: 'After food' });

  // Schedule Management States
  const [clinicHours, setClinicHours] = useState('09:00 AM - 05:00 PM');
  const [slotDuration, setSlotDuration] = useState('15 min');
  const [vacationMode, setVacationMode] = useState(false);
  const [emergencyBlock, setEmergencyBlock] = useState(false);

  // Auto-fill template when template changes
  useEffect(() => {
    if (selectedTemplate && prescriptionTemplates[selectedTemplate]) {
      setPrescriptionMedicines(prescriptionTemplates[selectedTemplate]);
    }
  }, [selectedTemplate]);

  // Environment-specific stats modification
  const getEnvironmentStats = () => {
    switch (environment) {
      case 'multi':
        return [
          { title: 'Waiting (Clinic Total)', value: 14, icon: Clock, color: 'amber' },
          { title: 'Checked-In (Total)', value: 8, icon: UserCheck, color: 'cyan' },
          { title: 'In Consultation', value: 4, icon: Stethoscope, color: 'purple' },
          { title: 'Completed Today', value: 32, icon: CheckCircle2, color: 'emerald' },
        ];
      case 'hospital':
        return [
          { title: 'Waiting (ER + OPD)', value: 48, icon: Clock, color: 'amber' },
          { title: 'Checked-In (Active)', value: 24, icon: UserCheck, color: 'cyan' },
          { title: 'In Consultation', value: 12, icon: Stethoscope, color: 'purple' },
          { title: 'Completed (Shift)', value: 114, icon: CheckCircle2, color: 'emerald' },
        ];
      case 'single':
      default:
        return [
          { title: 'Waiting Patients', value: patients.filter(p => p.status === 'waiting').length, icon: Clock, color: 'amber' },
          { title: 'Checked-In Patients', value: patients.filter(p => p.status === 'checked_in').length, icon: UserCheck, color: 'cyan' },
          { title: 'In Consultation', value: patients.filter(p => p.status === 'in_consultation').length, icon: Stethoscope, color: 'purple' },
          { title: 'Completed Today', value: patients.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'emerald' },
        ];
    }
  };

  const getProductivityMetrics = () => {
    switch (environment) {
      case 'multi':
        return { patientsToday: 45, avgTime: '18 min', followUpRate: '28%', revenue: '$3,450' };
      case 'hospital':
        return { patientsToday: 128, avgTime: '22 min', followUpRate: '35%', revenue: '$12,800' };
      case 'single':
      default:
        return { patientsToday: 18, avgTime: '12 min', followUpRate: '15%', revenue: '$1,200' };
    }
  };

  const productivity = getProductivityMetrics();

  // Handle workflow stage transitions
  const handleTransition = (patientId, newStatus) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, status: newStatus, waitTime: newStatus === 'in_consultation' || newStatus === 'completed' ? '0 min' : p.waitTime };
      }
      return p;
    }));
  };

  // Filter patients by stage and search keyword
  const filteredPatients = patients.filter(p => {
    const matchesStage = activeWorkflowStage === 'all' || p.status === activeWorkflowStage;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.phone.includes(searchTerm);
    return matchesStage && matchesSearch;
  });

  // Adding medicine in prescription writer
  const handleAddMedicine = () => {
    if (newMedicine.medicine.trim()) {
      setPrescriptionMedicines(prev => [...prev, newMedicine]);
      setNewMedicine({ medicine: '', dosage: '1 tablet', timing: '1-0-1', days: 5, notes: 'After food' });
    }
  };

  // Removing medicine in prescription writer
  const handleRemoveMedicine = (idx) => {
    setPrescriptionMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  // Simulated export to PDF
  const handleExportPrescription = () => {
    alert(`Prescription exported successfully as PDF for ${prescriptionWriterPatient?.name}!`);
    setPrescriptionWriterPatient(null);
    setPrescriptionMedicines([]);
    setSelectedTemplate('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header Actions with Environment Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Clinical Workstation</p>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Practice Control Desk</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <button
              onClick={() => setEnvironment('single')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${environment === 'single' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Briefcase size={14} /> Single Doctor
            </button>
            <button
              onClick={() => setEnvironment('multi')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${environment === 'multi' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Building size={14} /> Multi-Doctor Clinic
            </button>
            <button
              onClick={() => setEnvironment('hospital')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${environment === 'hospital' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Hospital size={14} /> Hospital
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {getEnvironmentStats().map((stat, idx) => {
          const Icon = stat.icon;
          const colorStyles = 
            stat.color === 'amber' ? 'bg-amber-500/10 text-amber-600 border-amber-200/50' :
            stat.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-600 border-cyan-200/50' :
            stat.color === 'purple' ? 'bg-purple-500/10 text-purple-600 border-purple-200/50' :
            'bg-emerald-500/10 text-emerald-600 border-emerald-200/50';

          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colorStyles}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left and Mid Column: Queue Workstation & Productivity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Queue-Based Workflow Workstation */}
          <Card 
            title="Real-Time Patient Visit Queue" 
            subtitle="Manage patient transitions through clinic check-in stages"
            action={
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by name/token..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white transition-all outline-none"
                />
              </div>
            }
          >
            {/* Workflow Stage Buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-4 no-scrollbar border-b border-slate-50">
              {['all', 'waiting', 'checked_in', 'in_consultation', 'follow_up', 'completed'].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveWorkflowStage(stage)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap border ${
                    activeWorkflowStage === stage 
                      ? 'bg-primary border-primary text-white shadow-sm' 
                      : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {stage.replace('_', ' ')} ({stage === 'all' ? patients.length : patients.filter(p => p.status === stage).length})
                </button>
              ))}
            </div>

            {/* Queue Cards list */}
            <div className="space-y-4 pt-4 min-h-[400px]">
              {filteredPatients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                    <Users size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Queue is clear</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">No active patients match the selected stage filter.</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-5 rounded-2xl border border-slate-200/60 hover:border-slate-350 hover:shadow-md transition-all duration-350 bg-white space-y-4 relative group"
                  >
                    
                    {/* Token & Patient main info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black text-xs uppercase tracking-wider">{patient.token}</span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-950">{patient.name}</h4>
                          <p className="text-[10px] font-medium text-slate-400">{patient.age} Yrs &bull; {patient.gender} &bull; {patient.phone}</p>
                        </div>
                      </div>

                      {/* Right top Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          patient.type === 'Telehealth' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-teal-50 text-teal-600 border-teal-150'
                        }`}>
                          {patient.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border uppercase ${
                          patient.status === 'waiting' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          patient.status === 'checked_in' ? 'bg-cyan-50 text-cyan-600 border-cyan-150' : 
                          patient.status === 'in_consultation' ? 'bg-purple-50 text-purple-650 border-purple-150' : 
                          patient.status === 'follow_up' ? 'bg-rose-50 text-rose-600 border-rose-150' : 
                          'bg-emerald-50 text-emerald-600 border-emerald-150'
                        }`}>
                          {patient.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Visit description and wait details */}
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Chief Complaint</span>
                        <span className="font-semibold text-slate-700">{patient.reason}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Wait time</span>
                        <span className="font-black text-slate-800 flex items-center justify-end gap-1">
                          <Clock size={12} className="text-amber-500" /> {patient.waitTime}
                        </span>
                      </div>
                    </div>

                    {/* Quick actions panel */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      
                      <button
                        onClick={() => setSelectedPatientForProfile(patient)}
                        className="h-9 px-3 rounded-xl border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5"
                        title="View Profile Timeline"
                      >
                        <Eye size={14} /> Profile
                      </button>

                      {patient.status === 'waiting' && (
                        <button
                          onClick={() => handleTransition(patient.id, 'checked_in')}
                          className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <UserCheck size={14} /> Check In
                        </button>
                      )}

                      {patient.status === 'checked_in' && (
                        <button
                          onClick={() => handleTransition(patient.id, 'in_consultation')}
                          className="h-9 px-3 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Stethoscope size={14} /> Start Consultation
                        </button>
                      )}

                      {patient.status === 'in_consultation' && (
                        <>
                          <button
                            onClick={() => setPrescriptionWriterPatient(patient)}
                            className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <FilePlus size={14} /> Write Prescription
                          </button>
                          <button
                            onClick={() => handleTransition(patient.id, 'follow_up')}
                            className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                          >
                            <Clock size={14} /> Follow-Up Required
                          </button>
                        </>
                      )}

                      {['in_consultation', 'follow_up'].includes(patient.status) && (
                        <button
                          onClick={() => handleTransition(patient.id, 'completed')}
                          className="h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} /> Complete Visit
                        </button>
                      )}

                      {patient.status === 'completed' && (
                        <span className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={14} /> Care visit completed today
                        </span>
                      )}

                      {['waiting', 'checked_in'].includes(patient.status) && (
                        <button
                          onClick={() => {
                            const newDate = prompt("Enter new reschedule date (YYYY-MM-DD):", "2026-06-25");
                            if (newDate) alert(`Patient rescheduled to ${newDate}`);
                          }}
                          className="h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <RefreshCw size={12} /> Reschedule
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Productivity Stats */}
          <Card 
            title="Clinician Performance & Metrics" 
            subtitle="Insight into patient turnaround and outcomes"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Patients</p>
                <p className="text-xl font-black text-slate-800">{productivity.patientsToday}</p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +8% vs. yesterday</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Consultation Time</p>
                <p className="text-xl font-black text-slate-800">{productivity.avgTime}</p>
                <span className="text-[10px] text-slate-400 font-medium">Optimal: 15 min</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Follow-Up Rate</p>
                <p className="text-xl font-black text-slate-800">{productivity.followUpRate}</p>
                <span className="text-[10px] text-indigo-600 font-bold">Consistent Care</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue Today</p>
                <p className="text-xl font-black text-slate-800">{productivity.revenue}</p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +12% target</span>
              </div>
            </div>
            
            <div className="pt-4">
              <Chart type="line" data={data?.appointmentChartData || []} dataKey="appointments" color="#6366f1" />
            </div>
          </Card>

        </div>

        {/* Right Column: Schedule Management & Calendar */}
        <div className="space-y-6">
          
          {/* Calendar */}
          <CalendarWidget selectedDate={selectedDate} onDateSelect={onDateSelect} />

          {/* Schedule Management Panel */}
          <Card 
            title="Schedule & Availability Management" 
            subtitle="Configure clinical hours and exceptions"
          >
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Clinic Hours</span>
                  <select 
                    value={clinicHours}
                    onChange={(e) => setClinicHours(e.target.value)}
                    className="p-1 rounded bg-slate-50 font-black text-[10px] uppercase border"
                  >
                    <option>09:00 AM - 05:00 PM</option>
                    <option>08:00 AM - 04:00 PM</option>
                    <option>10:00 AM - 06:00 PM</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Slot Duration</span>
                  <select 
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                    className="p-1 rounded bg-slate-50 font-black text-[10px] border"
                  >
                    <option>15 min</option>
                    <option>20 min</option>
                    <option>30 min</option>
                  </select>
                </div>
              </div>

              {/* Vacation Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Vacation Mode</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle clinic bookings off</p>
                </div>
                <button
                  onClick={() => {
                    setVacationMode(!vacationMode);
                    if (vacationMode) setEmergencyBlock(false);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${vacationMode ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${vacationMode ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Emergency Block Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Emergency Block</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cancel bookings for next 4 hours</p>
                </div>
                <button
                  onClick={() => {
                    setEmergencyBlock(!emergencyBlock);
                    if (!emergencyBlock) {
                      alert("Emergency Block Activated. Affected patients are being notified.");
                    }
                  }}
                  className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${emergencyBlock ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${emergencyBlock ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          </Card>

          {/* Quick Actions / Shortcuts panel */}
          <Card title="Workspace Quick Actions" subtitle="Rapid commands">
             <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => alert("Please click 'Write Prescription' on an active Consultation patient card below.")}
                  className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
                  variant="outline"
                >
                   <FilePlus size={18} className="text-emerald-500" /> Start New Prescription
                </Button>
                <Button 
                  onClick={() => {
                    const email = prompt("Enter patient email to start video consultation:");
                    if (email) alert(`Inviting ${email} to secure video consultation...`);
                  }}
                  className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
                  variant="outline"
                >
                   <Video size={18} className="text-indigo-500" /> Host Video Consult
                </Button>
                <Button 
                  onClick={() => alert("Redirecting to clinics settings module...")}
                  className="w-full justify-start gap-3 h-12 bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
                  variant="outline"
                >
                   <Building size={18} className="text-blue-500" /> Manage Branch Hours
                </Button>
             </div>
          </Card>

        </div>

      </div>

      {/* 9. PRESCRIPTION MANAGEMENT MODAL / OVERLAY */}
      {prescriptionWriterPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in duration-300">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescription Console</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Write Prescription: {prescriptionWriterPatient.name}</h3>
              </div>
              <button 
                onClick={() => {
                  setPrescriptionWriterPatient(null);
                  setPrescriptionMedicines([]);
                  setSelectedTemplate('');
                }}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              
              {/* Select Templates */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">Select Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-600 border-2 transition-all outline-none font-bold text-xs"
                >
                  <option value="">No Template (Blank Prescription)</option>
                  <option value="Common Cold">Common Cold & Cough</option>
                  <option value="Hypertension">Hypertension Routine</option>
                  <option value="Diabetes Follow-up">Diabetes Management</option>
                </select>
              </div>

              {/* Added Medicines List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Rx Medicines</label>
                {prescriptionMedicines.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 italic">No medicines added to prescription list yet.</p>
                ) : (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Medicine</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Timing</th>
                          <th className="p-3">Days</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                        {prescriptionMedicines.map((med, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-extrabold">{med.medicine}</td>
                            <td className="p-3">{med.dosage}</td>
                            <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-slate-150 text-slate-800 text-[10px] font-black">{med.timing}</span></td>
                            <td className="p-3">{med.days} days</td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => handleRemoveMedicine(idx)}
                                className="text-rose-500 hover:text-rose-700 font-bold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add New Medicine Form */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Add Custom Medicine</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Medicine Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Amoxicillin 500mg"
                      value={newMedicine.medicine}
                      onChange={(e) => setNewMedicine({...newMedicine, medicine: e.target.value})}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-600 transition-all outline-none font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Dosage</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1 tablet"
                      value={newMedicine.dosage}
                      onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-600 transition-all outline-none font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Timing Plan</label>
                    <select
                      value={newMedicine.timing}
                      onChange={(e) => setNewMedicine({...newMedicine, timing: e.target.value})}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-600 transition-all outline-none font-bold text-xs"
                    >
                      <option value="1-0-1">1-0-1 (Morning & Night)</option>
                      <option value="1-1-1">1-1-1 (Morning, Afternoon & Night)</option>
                      <option value="1-0-0">1-0-0 (Morning only)</option>
                      <option value="0-0-1">0-0-1 (Night only)</option>
                      <option value="SOS">SOS (As needed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Days Duration</label>
                    <input 
                      type="number" 
                      value={newMedicine.days}
                      onChange={(e) => setNewMedicine({...newMedicine, days: parseInt(e.target.value) || 1})}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-emerald-600 transition-all outline-none font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddMedicine}
                    className="h-10 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl transition-all"
                  >
                    Add to Rx List
                  </button>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400">Export includes official practice signature.</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPrescriptionWriterPatient(null);
                    setPrescriptionMedicines([]);
                    setSelectedTemplate('');
                  }}
                  className="h-11 px-5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-extrabold text-xs rounded-xl transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleExportPrescription}
                  className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1.5"
                >
                  <Printer size={16} /> Save & PDF Export
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 10. PATIENT TIMELINE DRAWER */}
      {selectedPatientForProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          
          {/* Backdrop Click */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={() => setSelectedPatientForProfile(null)}
          />

          <div className="bg-white w-full max-w-lg border-l border-slate-100 h-full shadow-2xl relative z-10 flex flex-col justify-between animate-in slide-in-from-right duration-350">
            
            {/* Header info */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Record Hub</span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedPatientForProfile.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedPatientForProfile.age} Yrs &bull; {selectedPatientForProfile.gender} &bull; {selectedPatientForProfile.phone}</p>
                </div>
                <button 
                  onClick={() => setSelectedPatientForProfile(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Timeline tab selector */}
              <div className="flex border-b border-slate-100 mt-6 gap-4 text-xs font-black uppercase tracking-wider">
                {['visits', 'prescriptions', 'reports', 'notes'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTimelineTab(tab)}
                    className={`pb-2 border-b-2 transition-all ${activeTimelineTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab contents */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              {activeTimelineTab === 'visits' && (
                <div className="space-y-6">
                  {selectedPatientForProfile.history?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic font-semibold">No previous visit records found for this patient.</p>
                  ) : (
                    selectedPatientForProfile.history.map((record, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-slate-100 space-y-2">
                        <span className="absolute -left-1.5 top-1 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white"></span>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400">{record.date}</span>
                          <span className="text-[9px] font-bold bg-slate-50 px-2 py-0.5 rounded border text-slate-600">{record.doctor}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Diagnosis: {record.diagnosis}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{record.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTimelineTab === 'prescriptions' && (
                <div className="space-y-4">
                  {selectedPatientForProfile.history?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic font-semibold">No past prescriptions on file.</p>
                  ) : (
                    selectedPatientForProfile.history.map((record, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                          <span>{record.date}</span>
                          <span>Sumatriptan, Ibuprofen</span>
                        </div>
                        <p className="text-xs font-bold text-slate-750">{record.prescription}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTimelineTab === 'reports' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 text-red-500"><FileText size={18} /></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Thyroid_Panel_Report.pdf</h4>
                        <p className="text-[9px] text-slate-400">Uploaded 2 days ago &bull; 1.2 MB</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-900"><Download size={16} /></button>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-500"><FileText size={18} /></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Lipid_Profile_May_2026.pdf</h4>
                        <p className="text-[9px] text-slate-400">Uploaded 1 month ago &bull; 850 KB</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-900"><Download size={16} /></button>
                  </div>
                </div>
              )}

              {activeTimelineTab === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-amber-50/20 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">Special Clinical Note</h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Patient has history of penicillin allergy. Please verify any antibiotic recommendations carefully before prescribing.
                    </p>
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-semibold">Authorized clinical view only.</span>
              <button
                onClick={() => setSelectedPatientForProfile(null)}
                className="h-10 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl transition-all"
              >
                Close Records
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
