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
  Eye
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
  const [activeMenu, setActiveMenu] = useState(null);

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

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      header: 'Patient Name', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
            {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <Link href={`/dashboard/patients/${row._id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
              {row.name}
            </Link>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">{row._id}</p>
          </div>
        </div>
      )
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
      header: 'STATUS', 
      accessor: 'status',
      render: (row) => (
        <div className="relative action-menu-container">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === `status-${row._id}` ? null : `status-${row._id}`);
            }}
            className={`p-2 rounded-xl transition-all ${activeMenu === `status-${row._id}` ? "bg-slate-900 text-white shadow-lg" : "hover:bg-slate-100 text-slate-400"}`}
          >
            <MoreVertical size={20} />
          </button>
          
          {activeMenu === `status-${row._id}` && (
            <div 
              className="absolute left-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="flex items-center justify-between w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                onClick={() => {
                  alert("Accepted");
                  setActiveMenu(null);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Accept
                </div>
                <CheckCircle size={14} className="text-emerald-500" />
              </button>
              <button 
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                onClick={() => {
                  alert("Pending");
                  setActiveMenu(null);
                }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Pending
              </button>
              <button 
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={() => {
                  alert("Rejected");
                  setActiveMenu(null);
                }}
              >
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                Reject
              </button>
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'VIEW', 
      accessor: 'view',
      render: (row) => (
        <div className="relative action-menu-container">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === `view-${row._id}` ? null : `view-${row._id}`);
            }}
            className={`p-2 rounded-xl transition-all ${activeMenu === `view-${row._id}` ? "bg-blue-600 text-white shadow-lg" : "hover:bg-slate-100 text-slate-400"}`}
          >
            <MoreVertical size={20} />
          </button>
          
          {activeMenu === `view-${row._id}` && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Link 
                href={`/dashboard/patients/${row._id}`}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <Eye size={16} />
                View Patient Details
              </Link>
            </div>
          )}
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

        <div className="xl:col-span-3 flex flex-col sm:flex-row gap-4 items-center">
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
          <Button variant="outline" size="lg" leftIcon={<Filter size={20} />} className="w-full sm:w-auto h-14 px-6 rounded-2xl">
            Filters
          </Button>
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
    </div>
  );
}
