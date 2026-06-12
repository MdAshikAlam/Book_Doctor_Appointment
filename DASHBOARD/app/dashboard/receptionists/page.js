"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
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
  UserPlus
} from 'lucide-react';
import { usersApi, authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/BranchContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { motion } from 'framer-motion';

export default function ReceptionistsPage() {
  const { user: currentUser } = useAuth();
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState(null);
  
  // Clinic branch context
  const { clinics, selectedClinicId } = useClinic();
  
  // Add Receptionist State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    clinicId: ''
  });

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpCode, setOtpCode] = useState(Array(6).fill(''));
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(300);
  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0 && !emailVerified) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpTimer, emailVerified]);

  const handleSendOTP = async () => {
    if (!addFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      setOtpSending(true);
      setOtpError(null);

      const res = await authApi.sendOtp(addFormData.email);

      if (res.status === 'success' || res.status === 'already_verified') {
        setOtpSent(true);
        setCooldown(60);
        setOtpTimer(300);
        setOtpCode(Array(6).fill(''));
        setOtpSuccess('Verification code sent to email!');
        setTimeout(() => setOtpSuccess(null), 10000);
      } else {
        setOtpError(res.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to connect to authentication server.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError(null);
      setOtpSuccess(null);

      const res = await authApi.verifyOtp(addFormData.email, fullOtp, addFormData.name);

      if (res.status === 'success') {
        setEmailVerified(true);
        setOtpSent(false);
        setOtpSuccess('Email verified successfully!');
      } else {
        setOtpError(res.message || 'Verification failed. Incorrect OTP.');
      }
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Connection error.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (value, idx) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpCode];
    newOtp[idx] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value !== '' && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && otpCode[idx] === '' && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOpenAddModal = () => {
    setAddFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      clinicId: selectedClinicId || ''
    });
    setEmailVerified(false);
    setOtpSent(false);
    setOtpError(null);
    setOtpSuccess(null);
    setOtpCode(Array(6).fill(''));
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      alert('Please verify the email address before proceeding.');
      return;
    }
    if (!addFormData.password || addFormData.password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    try {
      setIsCreating(true);
      const payload = {
        ...addFormData,
        role: 'receptionist'
      };
      await usersApi.createStaff(payload);
      setIsAddModalOpen(false);
      setSuccessMsg('Receptionist added successfully!');
      fetchReceptionists();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to add receptionist: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Password Reset State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // Success toast
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getStaff({ role: 'receptionist' });
      setReceptionists(res.data.staff || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin' || currentUser?.role === 'admin') {
      fetchReceptionists();
    }
  }, [currentUser]);

  const handleSuspend = async (id) => {
    try {
      await usersApi.suspend(id);
      setSuccessMsg('Receptionist account suspended successfully');
      fetchReceptionists();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await usersApi.reactivate(id);
      setSuccessMsg('Receptionist account activated successfully');
      fetchReceptionists();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedRep || !newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      setIsResetting(true);
      await usersApi.resetPassword(selectedRep._id, newPassword);
      setSuccessMsg(`Password for receptionist ${selectedRep.name} reset successfully!`);
      setShowResetPasswordModal(false);
      setNewPassword('');
      setSelectedRep(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to reset password: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredReceptionists = receptionists.filter(rep => 
    rep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Admins and Super Admins can manage Receptionist users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Receptionist Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Suspend, activate, or reset credentials for front-office clinic receptionist staff.</p>
        </div>
        <Button 
          onClick={handleOpenAddModal}
          className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <UserPlus size={20} /> Add Receptionist
        </Button>
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
                <th className="py-4 px-6 text-xs font-bold text-slate-450 uppercase tracking-wider">Receptionist Name</th>
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
              ) : filteredReceptionists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">No receptionist staff registered yet.</td>
                </tr>
              ) : (
                filteredReceptionists.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center font-black">
                          {rep.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{rep.name}</p>
                          <p className="text-xs text-slate-400">{rep.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building size={16} className="text-slate-400" />
                        {rep.branchName || 'Default'}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="text-slate-400" />
                        {rep.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        rep.status === 'suspended'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {rep.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rep.status === 'suspended' ? (
                          <button 
                            onClick={() => handleReactivate(rep._id)}
                            className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all border border-slate-100"
                            title="Activate Account"
                          >
                            <PlayCircle size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSuspend(rep._id)}
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100"
                            title="Suspend Account"
                          >
                            <PauseCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedRep(rep); setShowResetPasswordModal(true); }}
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Receptionist"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
          <Input 
            label="Full Name" 
            placeholder="John Doe"
            value={addFormData.name}
            onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
            required 
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group flex items-center">
              <input 
                type="email" 
                required
                disabled={emailVerified}
                value={addFormData.email}
                onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                placeholder="john@example.com"
                className="w-full h-12 pl-4 pr-24 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-sm disabled:opacity-60"
              />
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpSending || cooldown > 0 || !addFormData.email}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98]"
                >
                  {otpSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : cooldown > 0 ? `${cooldown}s` : otpSent ? 'Resend' : 'Verify'}
                </button>
              )}
            </div>
            {emailVerified && (
              <p className="text-[10px] font-black text-emerald-600 ml-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> Email Verified Successfully!
              </p>
            )}
            {otpSuccess && (
              <p className="text-[10px] font-black text-emerald-650 ml-1 mt-1">
                {otpSuccess}
              </p>
            )}
            {otpError && (
              <p className="text-[10px] font-black text-rose-500 ml-1 mt-1 flex items-center gap-1">
                <ShieldAlert size={12} /> {otpError}
              </p>
            )}
          </div>

          {/* OTP Verification Block */}
          {otpSent && !emailVerified && (() => {
            const formatTime = (seconds) => {
              const mins = Math.floor(seconds / 60);
              const secs = seconds % 60;
              return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            };

            return (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 animate-in fade-in duration-200 space-y-4">
                <div className="text-center">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Verify Email OTP</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold">
                    Enter the 6-digit OTP code sent to your email. {otpTimer > 0 ? `(Expires in ${formatTime(otpTimer)})` : <span className="text-rose-500 font-bold">(Expired)</span>}
                  </p>
                </div>


                <div className="flex justify-center gap-1.5">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      disabled={otpTimer === 0}
                      className="w-10 h-11 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-center font-black text-lg outline-none transition-all shadow-sm disabled:opacity-50"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyingOtp || otpTimer === 0}
                    className="w-full h-10 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending || cooldown > 0}
                      className="text-[9px] font-black text-blue-650 hover:text-blue-800 disabled:text-slate-400 uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {otpSending ? 'Resending...' : cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Code'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <Input 
            label="Password" 
            placeholder="••••••••"
            type="password"
            value={addFormData.password}
            onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
            required 
          />
          <Input 
            label="Phone Number" 
            placeholder="9876543210"
            value={addFormData.phone}
            onChange={(e) => setAddFormData({...addFormData, phone: e.target.value})}
          />
          {currentUser?.role === 'super_admin' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Clinic Branch</label>
              <select
                value={addFormData.clinicId}
                onChange={(e) => setAddFormData({...addFormData, clinicId: e.target.value})}
                required
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-sm"
              >
                <option value="">Select Clinic Branch...</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.clinicName} ({clinic.city})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              type="submit"
              disabled={isCreating || !emailVerified}
              className="flex-1 h-12 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50"
            >
              {isCreating ? 'Adding...' : 'Add Receptionist'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
