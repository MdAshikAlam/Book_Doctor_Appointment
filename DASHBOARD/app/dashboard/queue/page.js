"use client"

import React, { useState, useEffect } from 'react';
import { 
  Users, CalendarCheck, CheckCircle2, Clock, 
  Play, ClipboardList, Upload, CheckCircle, 
  PlusCircle, FilePlus, ArrowRight,
  TrendingUp, Activity, Search,
  Phone, UserCheck, Stethoscope, Video, MessageSquare,
  AlertCircle, ChevronRight, Eye, Calendar,
  FileText, ShieldAlert, Plus, RefreshCw, X, Download,
  Printer, History
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

// Initial Mock Patients list in FIFO queue order
const initialQueuePatients = [
  { id: '1', token: '001', name: 'Rahul Kumar', age: 32, gender: 'Male', phone: '+91 98765 43210', type: 'New Visit', reason: 'Fever & Cold', waitTime: '20 min', status: 'waiting', appointmentTime: '09:00 AM', history: [
    { date: '2026-05-10', doctor: 'Dr. Arundhati Sharma', diagnosis: 'Mild Viral Fever', prescription: 'Paracetamol 650mg, Vitamin C', notes: 'Advised rest and plenty of fluids.' }
  ]},
  { id: '2', token: '002', name: 'Priya Sharma', age: 27, gender: 'Female', phone: '+91 87654 32109', type: 'New Visit', reason: 'Headache & Fatigue', waitTime: '15 min', status: 'checked_in', appointmentTime: '09:15 AM', history: [] },
  { id: '3', token: '003', name: 'Amit Singh', age: 41, gender: 'Male', phone: '+91 76543 21098', type: 'Follow-Up', reason: 'Follow-Up Hypertension check', waitTime: '10 min', status: 'checked_in', appointmentTime: '09:30 AM', history: [
    { date: '2026-04-12', doctor: 'Dr. Arundhati Sharma', diagnosis: 'Essential Hypertension', prescription: 'Amlodipine 5mg', notes: 'BP was 145/92. Scheduled for review.' }
  ]},
  { id: '4', token: '004', name: 'Siddharth Patel', age: 35, gender: 'Male', phone: '+91 99887 76655', type: 'New Visit', reason: 'Acidity & Stomach Pain', waitTime: '5 min', status: 'waiting', appointmentTime: '09:45 AM', history: [] },
  { id: '5', token: '005', name: 'Nisha Verma', age: 29, gender: 'Female', phone: '+91 88776 65544', type: 'Follow-Up', reason: 'Skin rash follow-up', waitTime: '0 min', status: 'completed', appointmentTime: '08:30 AM', completedTime: '08:50 AM', history: [
    { date: '2026-06-10', doctor: 'Dr. Arundhati Sharma', diagnosis: 'Contact Dermatitis', prescription: 'Betamethasone cream', notes: 'Rash clearing up well. Advised to continue ointment.' }
  ]}
];

const prescriptionTemplates = {
  'Common Fever': [
    { medicine: 'Paracetamol 650mg', dosage: '1 tablet', timing: '1-0-1', days: 5, notes: 'After food' },
    { medicine: 'Amoxicillin 500mg', dosage: '1 capsule', timing: '1-1-1', days: 5, notes: 'Complete the course' }
  ],
  'Hypertension': [
    { medicine: 'Amlodipine 5mg', dosage: '1 tablet', timing: '1-0-0', days: 30, notes: 'Empty stomach in the morning' }
  ],
  'Gastric/Acidity': [
    { medicine: 'Pantoprazole 40mg', dosage: '1 tablet', timing: '1-0-0', days: 10, notes: '30 minutes before breakfast' }
  ]
};

export default function QueuePage() {
  const [patients, setPatients] = useState(initialQueuePatients);
  const [activeQueueTab, setActiveQueueTab] = useState('checked_in'); // Default to Checked-In as active workstation
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer / Overlay States
  const [viewingProfilePatient, setViewingProfilePatient] = useState(null);
  const [viewingHistoryPatient, setViewingHistoryPatient] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);

  // Consultation Form States
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ medicine: '', dosage: '1 tablet', timing: '1-0-1', days: 5, notes: 'After food' });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [needFollowUp, setNeedFollowUp] = useState(false);

  // Auto-fill template
  useEffect(() => {
    if (selectedTemplate && prescriptionTemplates[selectedTemplate]) {
      setPrescriptionMedicines(prescriptionTemplates[selectedTemplate]);
    }
  }, [selectedTemplate]);

  // Status transitions
  const handleTransition = (patientId, newStatus) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const update = { ...p, status: newStatus };
        if (newStatus === 'completed') {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          update.completedTime = time;
        }
        return update;
      }
      return p;
    }));
  };

  // Start Consultation trigger
  const handleStartConsultation = (patient) => {
    handleTransition(patient.id, 'in_consultation');
    setActiveConsultation(patient);
    // Reset workspace form
    setClinicalNotes('');
    setDiagnosis('');
    setPrescriptionMedicines([]);
    setSelectedTemplate('');
    setNeedFollowUp(false);
    setFollowUpNotes('');
  };

  // Complete consultation logic
  const handleCompleteConsultation = () => {
    if (!diagnosis.trim()) {
      alert("Please enter a Diagnosis before completing the consultation.");
      return;
    }

    // Add consultation details to patient history locally
    setPatients(prev => prev.map(p => {
      if (p.id === activeConsultation.id) {
        const newHistoryRecord = {
          date: new Date().toISOString().split('T')[0],
          doctor: 'Dr. Arundhati Sharma',
          diagnosis: diagnosis,
          prescription: prescriptionMedicines.map(m => `${m.medicine} (${m.dosage}, ${m.timing}, ${m.days} days)`).join(', ') || 'No medication prescribed',
          notes: clinicalNotes || 'Routine consultation completed.'
        };
        
        return {
          ...p,
          status: 'completed',
          completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          history: [newHistoryRecord, ...p.history]
        };
      }
      return p;
    }));

    // If follow-up required, simulate dispatch
    if (needFollowUp) {
      alert(`Follow-up scheduled for patient in ${followUpDays} days.`);
    }

    alert(`Prescription PDF generated successfully for ${activeConsultation.name}.`);
    setActiveConsultation(null);
  };

  // Add custom medicine to Rx
  const handleAddMedicine = () => {
    if (newMedicine.medicine.trim()) {
      setPrescriptionMedicines(prev => [...prev, newMedicine]);
      setNewMedicine({ medicine: '', dosage: '1 tablet', timing: '1-0-1', days: 5, notes: 'After food' });
    }
  };

  // Remove medicine from Rx
  const handleRemoveMedicine = (idx) => {
    setPrescriptionMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  // Filtering
  const filteredPatients = patients.filter(p => {
    const matchesTab = activeQueueTab === 'all' || p.status === activeQueueTab;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.token.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Page Title */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic Operations</p>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Today's Patient Queue</h1>
        </div>
        <div className="relative group max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name/token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:bg-white transition-all outline-none w-64"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting Patients</p>
            <p className="text-3xl font-black text-slate-900">{patients.filter(p => p.status === 'waiting').length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Checked-In Patients</p>
            <p className="text-3xl font-black text-slate-900">{patients.filter(p => p.status === 'checked_in').length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center border border-cyan-100">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Consultation</p>
            <p className="text-3xl font-black text-slate-900">{patients.filter(p => p.status === 'in_consultation').length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-100">
            <Stethoscope size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:-translate-y-0.5 transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Today</p>
            <p className="text-3xl font-black text-slate-900">{patients.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Workstation Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Patient Queue column */}
        <div className="xl:col-span-2 space-y-6">
          
          <Card title="Live Queue List" subtitle="Today's queue order (First In First Out)">
            {/* Live Queue Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-4 overflow-x-auto no-scrollbar">
              {['waiting', 'checked_in', 'in_consultation', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveQueueTab(tab)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    activeQueueTab === tab
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.replace('_', ' ')} ({patients.filter(p => p.status === tab).length})
                </button>
              ))}
            </div>

            {/* Queue Cards */}
            <div className="space-y-4 pt-4">
              {filteredPatients.length === 0 ? (
                <div className="py-24 text-center text-slate-400">
                  <p className="font-bold">No patients in this queue stage</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-5 rounded-2xl border border-slate-150 hover:border-slate-300 hover:shadow-sm bg-white space-y-4 transition-all"
                  >
                    
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                          {patient.token}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{patient.gender} &bull; {patient.age} Yrs &bull; {patient.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          patient.type === 'Follow-Up' ? 'bg-indigo-50 text-indigo-650 border-indigo-150' : 'bg-emerald-50 text-emerald-650 border-emerald-150'
                        }`}>
                          {patient.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-50 text-slate-500 border text-[9px] font-black tracking-wide uppercase">
                          Appt: {patient.appointmentTime}
                        </span>
                      </div>
                    </div>

                    {/* Complaint & Waiting Duration */}
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-750">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Visit Reason</span>
                        {patient.reason}
                      </div>
                      {patient.status !== 'completed' && (
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Waiting Duration</span>
                          <span className="text-amber-600 flex items-center justify-end gap-1"><Clock size={12} /> {patient.waitTime}</span>
                        </div>
                      )}
                      {patient.status === 'completed' && (
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Completed Time</span>
                          <span className="text-emerald-600 flex items-center justify-end gap-1"><CheckCircle2 size={12} /> {patient.completedTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setViewingProfilePatient(patient)}
                        className="h-9 px-3 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={14} /> View Profile
                      </button>
                      <button
                        onClick={() => setViewingHistoryPatient(patient)}
                        className="h-9 px-3 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <History size={14} /> View History
                      </button>

                      {patient.status === 'checked_in' && (
                        <button
                          onClick={() => handleStartConsultation(patient)}
                          className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Play size={14} className="fill-white" /> Start Consultation
                        </button>
                      )}

                      {patient.status === 'waiting' && (
                        <button
                          onClick={() => handleTransition(patient.id, 'checked_in')}
                          className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <UserCheck size={14} /> Check In Patient
                        </button>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* Workspace Panel / Dynamic details column */}
        <div className="space-y-6">
          <Card title="Active Workplace Status" subtitle="Launch a diagnostic portal below">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Current Consultation</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    {activeConsultation ? activeConsultation.name : 'No active patient visit'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick instructions */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-500 font-semibold leading-relaxed space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Workflow Guidelines</span>
            <p>1. Patients appear in the "Waiting" stage after online booking.</p>
            <p>2. Tap "Check In" when they arrive to push them to the live doctor list.</p>
            <p>3. Tap "Start Consultation" to launch the Workspace portal.</p>
          </div>
        </div>

      </div>

      {/* 5. CONSULTATION WORKSPACE (MODAL / FULLSCREEN VIEWER) */}
      {activeConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl border border-slate-100 shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Consultation Room</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Workspace: {activeConsultation.name} (Token {activeConsultation.token})</h2>
              </div>
              <button 
                onClick={() => handleTransition(activeConsultation.id, 'checked_in') || setActiveConsultation(null)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inner Content Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 custom-scrollbar">
              
              {/* Left Column: Patient Records, History, Allergies */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Basic Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-wide mb-1 text-primary">Patient Demographics</h3>
                  <p className="font-bold text-slate-700">Name: <span className="font-medium text-slate-600">{activeConsultation.name}</span></p>
                  <p className="font-bold text-slate-700">Age/Gender: <span className="font-medium text-slate-600">{activeConsultation.age} Years &bull; {activeConsultation.gender}</span></p>
                  <p className="font-bold text-slate-700">Complaint: <span className="font-medium text-slate-600">{activeConsultation.reason}</span></p>
                </div>

                {/* Allergies Alerts */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-1 text-xs">
                  <h3 className="font-black text-rose-600 uppercase text-[10px] tracking-wide flex items-center gap-1"><AlertCircle size={12} /> Allergy Alerts</h3>
                  <p className="font-bold text-rose-700">Penicillin Allergy reported.</p>
                </div>

                {/* Timeline and History */}
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-wide">Previous Visit History</h3>
                  {activeConsultation.history?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic font-semibold pl-2">No historical records available.</p>
                  ) : (
                    activeConsultation.history.map((record, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 bg-slate-50/20">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                          <span>{record.date}</span>
                          <span>{record.doctor}</span>
                        </div>
                        <p className="font-bold text-slate-800">Diagnosis: <span className="font-medium text-slate-600">{record.diagnosis}</span></p>
                        <p className="font-semibold text-slate-500 line-clamp-2">{record.notes}</p>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Mid & Right Column: Diagnosis, Prescription Writer, Clinical Notes */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Clinical Notes & Diagnosis Input */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Diagnosis</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Acute Upper Respiratory Tract Infection"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary border-2 transition-all outline-none font-semibold text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Clinical / Subjective Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Symptom onset, vitals, observations..."
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-primary border-2 transition-all outline-none font-semibold text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Prescription Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Prescribe Medication</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="p-1.5 rounded-lg bg-slate-50 font-black text-[10px] uppercase border"
                    >
                      <option value="">No Template</option>
                      <option value="Common Fever">Fever Protocol</option>
                      <option value="Hypertension">Hypertension Protocol</option>
                      <option value="Gastric/Acidity">Gastric Protocol</option>
                    </select>
                  </div>

                  {/* Medicines table */}
                  {prescriptionMedicines.length > 0 && (
                    <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5">Medication</th>
                            <th className="p-2.5">Dosage</th>
                            <th className="p-2.5">Timing</th>
                            <th className="p-2.5">Days</th>
                            <th className="p-2.5 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="font-bold text-slate-750 divide-y divide-slate-50">
                          {prescriptionMedicines.map((med, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-extrabold">{med.medicine}</td>
                              <td className="p-2.5">{med.dosage}</td>
                              <td className="p-2.5"><span className="px-1 py-0.5 rounded bg-slate-100 text-[10px] font-black">{med.timing}</span></td>
                              <td className="p-2.5">{med.days} days</td>
                              <td className="p-2.5 text-right"><button onClick={() => handleRemoveMedicine(idx)} className="text-rose-500 font-bold hover:underline">Remove</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add Custom drug form */}
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Drug Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Paracetamol 650mg"
                        value={newMedicine.medicine}
                        onChange={(e) => setNewMedicine({...newMedicine, medicine: e.target.value})}
                        className="w-full h-9 px-3 rounded-lg bg-white border outline-none focus:border-primary font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Dosage</label>
                      <input 
                        type="text" 
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                        className="w-full h-9 px-3 rounded-lg bg-white border outline-none focus:border-primary font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-0.5 block">Timing</label>
                      <input 
                        type="text" 
                        value={newMedicine.timing}
                        onChange={(e) => setNewMedicine({...newMedicine, timing: e.target.value})}
                        className="w-full h-9 px-3 rounded-lg bg-white border outline-none focus:border-primary font-semibold text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <button 
                        onClick={handleAddMedicine}
                        className="px-4 h-9 rounded-lg bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs transition-all"
                      >
                        Add to Prescription
                      </button>
                    </div>
                  </div>
                </div>

                {/* Follow-up block */}
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="needFollowUpCheckbox"
                      checked={needFollowUp}
                      onChange={(e) => setNeedFollowUp(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="needFollowUpCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">Schedule Follow-Up appointment</label>
                  </div>
                  {needFollowUp && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-1 duration-200">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Timeframe (days)</label>
                        <select 
                          value={followUpDays}
                          onChange={(e) => setFollowUpDays(parseInt(e.target.value))}
                          className="w-full h-10 rounded-xl bg-white border px-3 outline-none focus:border-primary font-bold"
                        >
                          <option value="3">3 Days</option>
                          <option value="7">7 Days (1 Week)</option>
                          <option value="14">14 Days (2 Weeks)</option>
                          <option value="30">30 Days (1 Month)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Follow-up Notes</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Return if fever persists"
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                          className="w-full h-10 rounded-xl bg-white border px-3 outline-none focus:border-primary font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-semibold">Consultation progress auto-saves.</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleTransition(activeConsultation.id, 'checked_in') || setActiveConsultation(null)}
                  className="h-11 px-5 border border-slate-200 hover:bg-slate-100 text-slate-650 font-extrabold text-xs rounded-xl transition-all"
                >
                  Suspend Session
                </button>
                <button
                  onClick={handleCompleteConsultation}
                  className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1.5"
                >
                  <Printer size={16} /> Complete & Print Rx
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Profile Detail Drawer */}
      {viewingProfilePatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setViewingProfilePatient(null)} />
          <div className="bg-white w-full max-w-md border-l border-slate-100 h-full shadow-2xl relative z-10 flex flex-col justify-between animate-in slide-in-from-right duration-350">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EMR Profile</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{viewingProfilePatient.name}</h3>
              </div>
              <button onClick={() => setViewingProfilePatient(null)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-450 hover:text-slate-650 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar text-xs">
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-black uppercase text-[10px] tracking-wide text-primary">Basic Information</h4>
                <p className="font-bold text-slate-700">Token: <span className="font-medium text-slate-600">#{viewingProfilePatient.token}</span></p>
                <p className="font-bold text-slate-700">Age/Gender: <span className="font-medium text-slate-600">{viewingProfilePatient.age} Yrs &bull; {viewingProfilePatient.gender}</span></p>
                <p className="font-bold text-slate-700">Mobile: <span className="font-medium text-slate-600">{viewingProfilePatient.phone}</span></p>
                <p className="font-bold text-slate-700">Appt Time: <span className="font-medium text-slate-600">{viewingProfilePatient.appointmentTime}</span></p>
              </div>

              <div className="space-y-3">
                <h4 className="font-black uppercase text-[10px] tracking-wide">Allergies & History</h4>
                <p className="p-3.5 rounded-xl border border-slate-100 bg-rose-50 text-rose-700 font-bold">Penicillin Allergy</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setViewingProfilePatient(null)} className="h-10 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* History Detail Drawer */}
      {viewingHistoryPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setViewingHistoryPatient(null)} />
          <div className="bg-white w-full max-w-md border-l border-slate-100 h-full shadow-2xl relative z-10 flex flex-col justify-between animate-in slide-in-from-right duration-350">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical History</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{viewingHistoryPatient.name}</h3>
              </div>
              <button onClick={() => setViewingHistoryPatient(null)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-450 hover:text-slate-650 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar text-xs">
              {viewingHistoryPatient.history?.length === 0 ? (
                <p className="text-slate-450 font-semibold italic">No previous consultations recorded.</p>
              ) : (
                viewingHistoryPatient.history.map((record, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                      <span>{record.date}</span>
                      <span>{record.doctor}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-800">Diagnosis: {record.diagnosis}</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">{record.notes}</p>
                    <p className="text-primary font-bold text-[11px] pt-1">Rx: {record.prescription}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setViewingHistoryPatient(null)} className="h-10 px-5 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl">Close History</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
