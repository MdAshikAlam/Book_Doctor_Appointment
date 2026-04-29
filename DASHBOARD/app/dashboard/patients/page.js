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
  MapPin
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Table from '@/components/dashboard/Table';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);

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

  const handleStatusUpdate = async (id, status) => {
    try {
      await usersApi.updatePatientStatus(id, status);
      fetchPatients();
      setActiveMenu(null);
    } catch (err) {
      alert(err.message);
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
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          row.patientStatus === 'Discharged'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {row.patientStatus || 'Active'}
        </span>
      )
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
                className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center justify-between w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                  onClick={() => {
                    handleStatusUpdate(row._id, row.patientStatus === 'Active' ? 'Discharged' : 'Active');
                  }}
                >
                  {row.patientStatus === 'Active' ? 'Discharge Patient' : 'Mark as Active'}
                  <CheckCircle size={14} />
                </button>
                <button
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  onClick={() => {
                    alert("Account Deactivated");
                    setActiveMenu(null);
                  }}
                >
                  Deactivate
                  <XCircle size={14} />
                </button>
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
              {['all', 'Active', 'Discharged'].map((s) => (
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
        <Card className="p-0 border-none shadow-sm overflow-hidden rounded-[2rem]">
          <Table
            columns={columns}
            data={filteredPatients}
            emptyMessage="No patients found matching your search."
          />
        </Card>
      )}

      {/* View Details Modal */}
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

              {!viewingPatient.aadhaar && (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-bold italic">No booking history available for this patient yet.</p>
                </div>
              )}
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
    </div>
  );
}
