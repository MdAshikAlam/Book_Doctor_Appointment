"use client"

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Calendar,
  Lock,
  PauseCircle,
  PlayCircle,
  KeyRound,
  History
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { motion } from 'framer-motion';

export default function ClinicAdminsPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  // Password Reset State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // Success toast
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getStaff({ role: 'admin' });
      setAdmins(res.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchAdmins();
    }
  }, [currentUser]);

  const handleSuspend = async (id) => {
    try {
      await usersApi.suspend(id);
      setSuccessMsg('Clinic admin suspended successfully');
      fetchAdmins();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await usersApi.reactivate(id);
      setSuccessMsg('Clinic admin activated successfully');
      fetchAdmins();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAdmin || !newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      setIsResetting(true);
      await usersApi.resetPassword(selectedAdmin._id, newPassword);
      setSuccessMsg(`Password for ${selectedAdmin.name} reset successfully!`);
      setShowResetPasswordModal(false);
      setNewPassword('');
      setSelectedAdmin(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to reset password: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredAdmins = admins.filter(adm => 
    adm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can manage Clinic Administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinic Admin Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Suspend, activate, or reset credentials for clinic onboarding tenants.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-650 font-bold border border-emerald-100 rounded-2xl flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative group max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email or clinic branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="py-4 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider">Admin Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider">Clinic Branch</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">No clinic administrators registered yet.</td>
                </tr>
              ) : (
                filteredAdmins.map((adm) => (
                  <tr key={adm._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center font-black">
                          {adm.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{adm.name}</p>
                          <p className="text-xs text-slate-400">{adm.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building size={16} className="text-slate-400" />
                        {adm.branchName || adm.clinicName || 'Default'}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="text-slate-400" />
                        {adm.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        adm.status === 'suspended'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {adm.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {adm.status === 'suspended' ? (
                          <button 
                            onClick={() => handleReactivate(adm._id)}
                            className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all border border-slate-100"
                            title="Activate Account"
                          >
                            <PlayCircle size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSuspend(adm._id)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100"
                            title="Suspend Account"
                          >
                            <PauseCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedAdmin(adm); setShowResetPasswordModal(true); }}
                          className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
                          title="Reset Password"
                        >
                          <KeyRound size={18} />
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

      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        title="Reset Account Password"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowResetPasswordModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleResetPassword}
              disabled={newPassword.length < 8 || isResetting}
              className="flex-1 h-12 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50"
            >
              {isResetting ? 'Saving...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
