"use client"

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  RotateCcw, 
  Building2, 
  Stethoscope, 
  UserCircle,
  AlertCircle,
  Loader2,
  Filter,
  History
} from 'lucide-react';
import { usersApi, clinicsApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function SafetyArchivesPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('admins');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'admins') {
        const res = await usersApi.getAdminRequests('rejected');
        setData(res.data.admins || []);
      } else if (activeTab === 'clinics') {
        const res = await clinicsApi.getPending('rejected');
        setData(res.data.clinics || []);
      } else if (activeTab === 'doctors') {
        const res = await doctorsApi.getPending('rejected');
        setData(res.data.doctors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchData();
    }
  }, [activeTab, currentUser]);

  const handleRestore = async (id) => {
    try {
      setIsProcessing(true);
      if (activeTab === 'admins') await usersApi.updateStatus(id, 'pending');
      else if (activeTab === 'clinics') await clinicsApi.updateStatus(id, 'pending');
      else if (activeTab === 'doctors') await doctorsApi.updateStatus(id, 'submitted');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) return;
    try {
      setIsProcessing(true);
      if (activeTab === 'admins') await usersApi.delete(id);
      else if (activeTab === 'clinics') { /* clinicsApi.delete(id) */ }
      else if (activeTab === 'doctors') await doctorsApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredData = data.filter(item => {
    const name = item.name || item.user?.name || item.clinicName || '';
    const email = item.email || item.user?.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can access safety archives.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Safety & Rejected Archives</h1>
          <p className="text-slate-500 mt-1 font-medium">Review, restore, or permanently remove rejected registrations.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-2xl border border-red-100">
          <History size={20} className="shrink-0" />
          <span className="font-bold text-sm">Audit Trail Mode</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'admins' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <UserCircle size={18} /> Admins
        </button>
        <button 
          onClick={() => setActiveTab('clinics')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'clinics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Building2 size={18} /> Clinics
        </button>
        <button 
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'doctors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Stethoscope size={18} /> Doctors
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            placeholder={`Search rejected ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-red-500 transition-all outline-none font-medium text-sm"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest border border-slate-100">
          <Filter size={14} /> status: rejected
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejection Reason</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Rejected</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <p className="font-bold text-slate-400">No rejected {activeTab} found in the archives.</p>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-black">
                        {item.name?.charAt(0) || item.user?.name?.charAt(0) || activeTab.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{item.name || item.user?.name || item.clinicName}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.email || item.user?.email || item.registrationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-xs">
                      <p className="text-sm font-bold text-red-600 leading-relaxed italic">
                        "{item.rejectionReason || 'No reason provided.'}"
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleRestore(item._id)}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                        title="Restore to Pending"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        title="Delete Permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
