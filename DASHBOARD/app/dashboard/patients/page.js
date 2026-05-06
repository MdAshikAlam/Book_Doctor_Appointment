"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Download,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  ClipboardList,
  FileText,
  Stethoscope,
  Pill,
  FileUp,
  Hospital,
  LogOut,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/dashboard/Table';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);

  // Clinical Modal States
  const [prescriptionModal, setPrescriptionModal] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [followUpModal, setFollowUpModal] = useState(null);
  const [dischargeModal, setDischargeModal] = useState(null);

  // Form States
  const [prescriptionForm, setPrescriptionForm] = useState([{ medicine: '', dosage: '', timing: '1-0-1', days: 5, notes: 'After food' }]);
  const [notesForm, setNotesForm] = useState({ symptoms: '', diagnosis: '', observations: '', advice: '' });
  const [reportForm, setReportForm] = useState({ reportName: '', reportType: 'PDF', file: null });
  const [followUpForm, setFollowUpForm] = useState({ date: '', notes: '' });
  const [dischargeForm, setDischargeForm] = useState({ summary: '', finalAdvice: '', medicines: '', nextVisitRecommendation: '' });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-menu-container')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getPatients();
      setPatients(response.data.patients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.patientStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id, status, medicalData = {}) => {
    try {
      await usersApi.updatePatientStatus(id, { patientStatus: status, ...medicalData });
      fetchPatients();
      setActiveMenu(null);
      // Close all modals
      setPrescriptionModal(null);
      setNotesModal(null);
      setReportModal(null);
      setFollowUpModal(null);
      setDischargeModal(null);
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
      const response = await doctorsApi.upload(formData);
      setReportForm({ ...reportForm, file: file, reportUrl: response.data.url });
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const columns = [
    {
      header: 'Patient Name',
      accessor: 'name',
      render: (row) => {
        const calculateAge = (dobString) => {
          if (!dobString) return null;
          const birthDate = new Date(dobString);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        };
        const age = calculateAge(row.dob);

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 uppercase">
              {row.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingPatient(row)}
                  className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                >
                  {row.fullName || row.name}
                </button>
                {age !== null && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                    {age} Yrs
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">{row.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Mail size={12} className="text-slate-400" />
            {row.email}
          </div>
          {row.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone size={12} className="text-slate-400" />
              {row.phone}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Aadhaar ID',
      accessor: 'aadhaar',
      render: (row) => (
        <div className="text-xs font-bold text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 inline-block">
          {row.aadhaar || 'N/A'}
        </div>
      )
    },
    {
      header: 'Last Consultation',
      accessor: 'reason',
      render: (row) => (
        <div className="max-w-[200px]">
          <p className="text-xs font-bold text-slate-900 truncate">{row.reason || 'No history'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {row.city ? `${row.city}, ${row.country}` : 'Location unknown'}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'patientStatus',
      render: (row) => {
        const getStatusStyles = (status) => {
          switch (status) {
            case 'Discharged': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'Deactivated': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Active': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Admitted': return 'bg-red-50 text-red-600 border-red-100';
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
          }
        };
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(row.patientStatus)}`}>
            {row.patientStatus || 'Active'}
          </span>
        );
      }
    },
    {
      header: 'Joined Date',
      accessor: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Calendar size={12} className="text-slate-400" />
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    },
    {
      header: 'ACTIONS',
      accessor: 'view',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingPatient(row)}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <div className="relative action-menu-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === `row-${row._id}` ? null : `row-${row._id}`);
              }}
              className={`p-2 rounded-xl transition-all ${activeMenu === `row-${row._id}` ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-100 text-slate-400"}`}
            >
              <MoreVertical size={18} />
            </button>

            {activeMenu === `row-${row._id}` && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MenuButton 
                  icon={<Eye size={18} />} 
                  label="View Profile" 
                  onClick={() => { setViewingPatient(row); setActiveMenu(null); }} 
                />

                {user?.role === 'doctor' && (
                  <>
                    <MenuButton 
                      icon={<Stethoscope size={18} />} 
                      label="Start Consultation" 
                      color="text-blue-600"
                      onClick={() => handleStatusUpdate(row._id, 'Active')} 
                    />
                    <MenuButton 
                      icon={<Pill size={18} />} 
                      label="Add Prescription" 
                      onClick={() => { setPrescriptionModal(row); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={<ClipboardList size={18} />} 
                      label="Add Notes" 
                      onClick={() => { setNotesModal(row); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={<FileUp size={18} />} 
                      label="Upload Report" 
                      onClick={() => { setReportModal(row); setActiveMenu(null); }} 
                    />
                    <MenuButton 
                      icon={<Calendar size={18} />} 
                      label="Add Follow-up" 
                      onClick={() => { setFollowUpModal(row); setActiveMenu(null); }} 
                    />
                  </>
                )}

                <div className="h-px bg-slate-50 my-1" />

                <MenuButton 
                  icon={<CheckCircle size={18} />} 
                  label={row.patientStatus === 'Active' ? 'Discharge Patient' : 'Mark as Active'} 
                  color="text-emerald-600"
                  onClick={() => {
                    if (row.patientStatus === 'Active') {
                      setDischargeModal(row);
                    } else {
                      handleStatusUpdate(row._id, 'Active');
                    }
                  }} 
                />
                
                <MenuButton 
                  icon={<XCircle size={18} />} 
                  label="Deactivate" 
                  color="text-rose-600"
                  onClick={() => {
                    if (confirm("Are you sure you want to deactivate this patient record?")) {
                      handleStatusUpdate(row._id, 'Deactivated');
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all registered patients on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
            Export List
          </Button>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-1 border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Users size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Patients</p>
              <h3 className="text-3xl font-black mt-1">{patients.length}</h3>
            </div>
          </div>
        </Card>

        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none text-slate-900 font-medium"
              />
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-auto h-14">
              {['all', 'Active', 'Discharged', 'Deactivated'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 sm:px-6 h-full rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    statusFilter === s
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-400 mt-4 font-bold">Fetching patient records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-red-900">Failed to load patients</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <Button
            variant="outline"
            className="mt-6 border-red-200 text-red-600 hover:bg-red-100"
            onClick={fetchPatients}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <Card noPadding className="border-none shadow-sm overflow-hidden rounded-[2rem]">
          <Table
            columns={columns}
            data={filteredPatients}
            emptyMessage="No patients found matching your search."
          />
        </Card>
      )}

      {/* View Details Modal */}
      <AnimatePresence>
        {viewingPatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300"
            >
              {/* Modal Header */}
              <div className="p-8 bg-slate-900 text-white relative">
                <button
                  onClick={() => setViewingPatient(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                >
                  <XCircle size={24} />
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20 uppercase">
                    {viewingPatient?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black leading-none">{viewingPatient.name}</h3>
                    <p className="text-blue-400 text-xs font-bold mt-2 uppercase tracking-widest">Patient Profile</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Personal Info */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Mail size={14} /> Contact & Personal Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Email Address</p>
                      <p className="text-sm font-black text-slate-900">{viewingPatient.email}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Phone Number</p>
                      <p className="text-sm font-black text-slate-900">{viewingPatient.phone || 'Not Provided'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Current Age</p>
                      <p className="text-sm font-black text-blue-700">
                        {(() => {
                          if (!viewingPatient.dob) return 'N/A';
                          const birthDate = new Date(viewingPatient.dob);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                          return `${age} Years`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking History Details */}
                {viewingPatient.aadhaar && (
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <AlertCircle size={14} /> Details from Latest Booking
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Aadhaar ID</p>
                        <p className="text-sm font-black text-slate-900">{viewingPatient.aadhaar}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Date of Birth</p>
                        <p className="text-sm font-black text-slate-900">{new Date(viewingPatient.dob).toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Gender</p>
                        <p className="text-sm font-black text-slate-900">{viewingPatient.gender}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Returning Patient?</p>
                        <p className="text-sm font-black text-slate-900">{viewingPatient.visitedBefore ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 col-span-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                          <MapPin size={12} /> Registered Address
                        </p>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed mt-1">
                          {viewingPatient.address}, {viewingPatient.city}, {viewingPatient.country}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medical History Section */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ClipboardList size={14} /> Medical History & Records
                  </h4>
                  
                  {/* Consultation Notes */}
                  {viewingPatient.consultationNotes && (
                    <div className="p-6 rounded-[2rem] bg-blue-50/50 border border-blue-100">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-3">Latest Consultation Notes</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-slate-700">
                        {viewingPatient.consultationNotes.symptoms && (
                          <div>
                            <p className="text-[9px] text-blue-400 uppercase">Symptoms</p>
                            <p>{viewingPatient.consultationNotes.symptoms}</p>
                          </div>
                        )}
                        {viewingPatient.consultationNotes.diagnosis && (
                          <div>
                            <p className="text-[9px] text-blue-400 uppercase">Diagnosis</p>
                            <p>{viewingPatient.consultationNotes.diagnosis}</p>
                          </div>
                        )}
                        {viewingPatient.consultationNotes.observations && (
                          <div className="md:col-span-2">
                            <p className="text-[9px] text-blue-400 uppercase">Observations</p>
                            <p>{viewingPatient.consultationNotes.observations}</p>
                          </div>
                        )}
                        {viewingPatient.consultationNotes.advice && (
                          <div className="md:col-span-2">
                            <p className="text-[9px] text-blue-400 uppercase">Medical Advice</p>
                            <p className="text-blue-600 bg-white p-3 rounded-xl border border-blue-100 mt-1">{viewingPatient.consultationNotes.advice}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prescriptions */}
                  {viewingPatient.prescriptions && viewingPatient.prescriptions.length > 0 && (
                    <div className="p-6 rounded-[2rem] bg-emerald-50/50 border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600 uppercase mb-3">Active Medications</p>
                      <div className="space-y-3">
                        {viewingPatient.prescriptions.map((med, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-black text-slate-900">{med.medicine}</p>
                              <p className="text-[10px] font-bold text-slate-400">{med.dosage} • {med.timing} • {med.days} Days</p>
                            </div>
                            {med.notes && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{med.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reports */}
                  {viewingPatient.reports && viewingPatient.reports.length > 0 && (
                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Medical Reports</p>
                      <div className="grid grid-cols-2 gap-3">
                        {viewingPatient.reports.map((report, i) => (
                          <a 
                            key={i} 
                            href={getFullImageUrl(report.reportUrl)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-600 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{report.reportName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{report.reportType}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up */}
                  {viewingPatient.followUp && (
                    <div className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Next Follow-up</p>
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-xl border border-amber-100 font-black text-amber-600 text-sm">
                          {new Date(viewingPatient.followUp.date).toLocaleDateString()}
                        </div>
                        {viewingPatient.followUp.notes && <p className="text-xs font-bold text-slate-600 italic">"{viewingPatient.followUp.notes}"</p>}
                      </div>
                    </div>
                  )}

                  {/* Discharge Summary */}
                  {viewingPatient.dischargeSummary && (
                    <div className="p-6 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Discharge Summary</p>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase">Final Advice</p>
                          <p className="text-sm font-bold">{viewingPatient.dischargeSummary.finalAdvice}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Home Medicines</p>
                            <p className="text-xs font-medium">{viewingPatient.dischargeSummary.medicines}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Discharged At</p>
                            <p className="text-xs font-medium">{new Date(viewingPatient.dischargeSummary.dischargedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Legacy Fields */}
                  {!viewingPatient.consultationNotes && !viewingPatient.prescriptions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingPatient.diagnosis && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Diagnosis</p>
                          <p className="text-sm font-black text-slate-900">{viewingPatient.diagnosis}</p>
                        </div>
                      )}
                      {viewingPatient.prescription && (
                        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Prescription</p>
                          <p className="text-sm font-black text-slate-900">{viewingPatient.prescription}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setViewingPatient(null)}
                  className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {/* Prescription Modal */}
        {prescriptionModal && (
          <Modal title="Add Prescription" icon={<Pill />} onClose={() => setPrescriptionModal(null)}>
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
              <button onClick={() => handleStatusUpdate(prescriptionModal._id, prescriptionModal.patientStatus, { prescriptions: prescriptionForm })} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Save Prescription</button>
            </div>
          </Modal>
        )}

        {/* Notes Modal */}
        {notesModal && (
          <Modal title="Clinical Consultation Notes" icon={<ClipboardList />} onClose={() => setNotesModal(null)}>
            <div className="space-y-4">
              <NoteField label="Symptoms" value={notesForm.symptoms} onChange={(v) => setNotesForm({...notesForm, symptoms: v})} placeholder="Describe patient symptoms..." />
              <NoteField label="Diagnosis" value={notesForm.diagnosis} onChange={(v) => setNotesForm({...notesForm, diagnosis: v})} placeholder="Enter medical diagnosis..." />
              <NoteField label="Observations" value={notesForm.observations} onChange={(v) => setNotesForm({...notesForm, observations: v})} placeholder="Enter physical observations..." />
              <NoteField label="Advice" value={notesForm.advice} onChange={(v) => setNotesForm({...notesForm, advice: v})} placeholder="Enter medical advice..." />
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setNotesModal(null)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black">Cancel</button>
              <button onClick={() => handleStatusUpdate(notesModal._id, notesModal.patientStatus, { consultationNotes: notesForm })} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Save Notes</button>
            </div>
          </Modal>
        )}

        {/* Report Modal */}
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
                handleStatusUpdate(reportModal._id, reportModal.patientStatus, { reports: [...currentReports, { ...reportForm, uploadedAt: new Date() }] });
              }} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Upload Report</button>
            </div>
          </Modal>
        )}

        {/* Follow-up Modal */}
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
              <button onClick={() => handleStatusUpdate(followUpModal._id, followUpModal.patientStatus, { followUp: followUpForm })} className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200">Schedule</button>
            </div>
          </Modal>
        )}

        {/* Discharge Modal */}
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
              <button onClick={() => handleStatusUpdate(dischargeModal._id, 'Discharged', { dischargeSummary: { ...dischargeForm, dischargedAt: new Date() } })} className="flex-[2] h-14 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200">Complete Discharge</button>
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
      >
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              {React.cloneElement(icon, { size: 24 })}
            </div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <XCircle size={24} className="text-slate-400" />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
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
        className="w-full h-24 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-bold resize-none text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

function MenuButton({ icon, label, onClick, color = "text-slate-600" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold ${color} hover:bg-slate-50 transition-all text-left`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DetailItem({ label, value, icon, className = "" }) {
  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm ${className}`}>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="text-sm font-black text-slate-900">{value || 'N/A'}</p>
    </div>
  );
}
