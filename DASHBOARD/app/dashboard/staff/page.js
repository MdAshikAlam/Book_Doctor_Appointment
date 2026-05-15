"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Mail, 
  Phone, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  CalendarCheck,
  MapPin,
  PauseCircle,
  PlayCircle,
  KeyRound,
  Repeat,
  History,
  Lock,
  ArrowRightLeft,
  AlertTriangle,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/BranchContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export default function StaffManagementPage() {
  const { user: currentUser } = useAuth();
  const { clinics, selectedClinic, selectedClinicId } = useClinic();
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [viewMode, setViewMode] = useState(currentUser?.role === 'super_admin' ? 'hierarchy' : 'list');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    phone: '',
    clinicId: '',
  });

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showTransferDataModal, setShowTransferDataModal] = useState(false);
  const [showActivityLogsModal, setShowActivityLogsModal] = useState(false);
  const [showTrashBinModal, setShowTrashBinModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [transferData, setTransferData] = useState({ fromAdminId: '', toAdminId: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      if (currentUser?.role === 'super_admin' && viewMode === 'hierarchy') {
        const res = await usersApi.getHierarchy();
        setHierarchy(res.data.hierarchy || []);
      } else {
        const res = await usersApi.getStaff();
        setStaff(res.data.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.role, viewMode]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenAddModal = () => {
    if (currentUser?.role === 'admin') {
      const approvedClinics = clinics.filter(b => b.clinicStatus === 'approved');
      if (approvedClinics.length === 0) {
        alert("You must have at least one APPROVED clinic before adding staff members. Please wait for the super admin to approve your clinic registration.");
        router.push('/dashboard/clinics');
        return;
      }
    }
    setEditingUser(null);
    setFormData({ 
      name: '', email: '', password: '', 
      role: currentUser?.role === 'super_admin' ? 'admin' : 'receptionist', 
      phone: '',
      clinicId: selectedClinicId || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingUser(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '', // Optional for edit
      role: member.role || 'receptionist',
      phone: member.phone || '',
      clinicId: member.branchId || '',
    });
    setIsModalOpen(true);
  };
  
  const handleOpenViewModal = (member) => {
    setViewingUser(member);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        await usersApi.update(editingUser._id, payload);
      } else {
        const payload = { ...formData };
        if (!payload.password) payload.password = 'Password123!';
        
        await usersApi.createStaff(payload);
      }
      
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await usersApi.delete(userToDelete._id);
      setUserToDelete(null);
      fetchStaff();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuspendUser = async (id) => {
    try {
      setIsProcessing(true);
      await usersApi.suspend(id);
      fetchStaff();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateUser = async (id) => {
    try {
      setIsProcessing(true);
      await usersApi.reactivate(id);
      fetchStaff();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    try {
      setIsProcessing(true);
      await usersApi.resetPassword(editingUser._id, newPassword);
      setShowResetPasswordModal(false);
      setNewPassword('');
      alert('Password reset successfully. The user has been logged out from all devices.');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferData = async () => {
    if (!transferData.fromAdminId || !transferData.toAdminId) {
      alert('Please select both source and destination admins');
      return;
    }
    try {
      setIsProcessing(true);
      await usersApi.transferData(transferData);
      setShowTransferDataModal(false);
      setTransferData({ fromAdminId: '', toAdminId: '' });
      fetchStaff();
      alert('Data transferred successfully');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setIsProcessing(true);
      setShowActivityLogsModal(true);
      const res = await usersApi.getActivityLogs();
      setActivityLogs(res.data.logs || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchTrashBin = async () => {
    try {
      setIsProcessing(true);
      setShowTrashBinModal(true);
      const res = await usersApi.getTrashBin();
      setTrashItems(res.data.items || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreData = async (adminId) => {
    try {
      setIsProcessing(true);
      await usersApi.restoreFromTrash(adminId);
      setShowTrashBinModal(false);
      fetchStaff();
      alert('Data restored successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return { label: 'Super Admin', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: ShieldAlert };
      case 'admin': return { label: 'Admin', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: ShieldCheck };
      case 'receptionist': return { label: 'Receptionist', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Shield };
      case 'doctor': return { label: 'Doctor', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Users };
      default: return { label: role, color: 'bg-slate-50 text-slate-600 border-slate-100', icon: Users };
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Warning for Admins with no clinics */}
      {currentUser?.role === 'admin' && (!clinics || clinics.length === 0) && (
        <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 className="text-amber-900 font-bold text-lg">
              {clinics.length === 0 ? "No Clinics Registered" : "Pending Clinic Approval"}
            </h3>
            <p className="text-amber-700 font-medium">
              {clinics.length === 0 
                ? "To manage staff and receptionists, you must first register your clinic." 
                : "Your clinic is currently pending approval. Clinical records and staff management are only available once your clinic is approved by a super admin."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/clinics')}
              className="mt-4 border-amber-200 text-amber-700 hover:bg-amber-100 font-bold px-6 h-10 rounded-xl"
            >
              Register Clinic Now
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admins & Staff Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage platform administrators, receptionists, and medical staff permissions.</p>
        </div>
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && (
          <div className="flex flex-wrap items-center gap-3">
            {currentUser?.role === 'super_admin' && (
              <>
                <Button 
                  onClick={fetchTrashBin}
                  variant="outline"
                  className="h-12 px-5 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} /> Trash Bin
                </Button>
                <Button 
                  onClick={fetchActivityLogs}
                  variant="outline"
                  className="h-12 px-5 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <History size={18} /> View Logs
                </Button>
                <Button 
                  onClick={() => setShowTransferDataModal(true)}
                  variant="outline"
                  className="h-12 px-5 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ArrowRightLeft size={18} /> Transfer Data
                </Button>
              </>
            )}
            <Button 
              onClick={handleOpenAddModal}
              className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <UserPlus size={20} /> Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Search & View Toggle */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 group max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>

      </div>

      {viewMode === 'hierarchy' && currentUser?.role === 'super_admin' ? (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white p-20 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
               <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
               <p className="font-bold text-slate-400">Structuring system hierarchy...</p>
            </div>
          ) : hierarchy.length === 0 ? (
            <div className="bg-white p-20 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
               <p className="font-bold text-slate-500">No hierarchy data available.</p>
            </div>
          ) : (
            hierarchy.map((admin) => (
              <AdminTree 
                key={admin._id} 
                admin={admin} 
                onEdit={handleOpenEditModal} 
                onDelete={setUserToDelete} 
                currentUser={currentUser}
                handleSuspendUser={handleSuspendUser}
                handleReactivateUser={handleReactivateUser}
                setEditingUser={setEditingUser}
                setShowResetPasswordModal={setShowResetPasswordModal}
                setViewingUser={setViewingUser}
              />
            ))
          )}
        </div>
      ) : (
        /* Staff Table View */
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Context</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400">
                      <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="font-bold">Fetching system staff...</p>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center text-slate-500">
                      <p className="font-bold">No staff members found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => {
                    const role = getRoleBadge(member.role);
                    const Icon = role.icon;
                    return (
                      <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                              {member.avatar ? <img src={getFullImageUrl(member.avatar)} alt="" className="w-full h-full object-cover" /> : member.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{member.name}</p>
                              <p className="text-xs font-medium text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${role.color}`}>
                            <Icon size={12} />
                            {role.label}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Mail size={12} className="text-slate-300" /> {member.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Phone size={12} className="text-slate-300" /> {member.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <MapPin size={12} className="text-primary" /> {member.branchName || 'Global Access'}
                            </p>
                            {member.branchName && (
                              <p className="text-[10px] text-slate-400 font-medium ml-4">
                                {member.city || 'Main Office'}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <button 
                              onClick={() => handleOpenViewModal(member)}
                              className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && member.role !== 'doctor' && (
                              <button 
                                onClick={() => handleOpenEditModal(member)}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && member.role !== 'doctor' && currentUser?._id !== member._id && (
                              <button 
                                onClick={() => setUserToDelete(member)}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-red-500 transition-all"
                                title="Delete User"
                               >
                                <Trash2 size={18} />
                              </button>
                            )}
                            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && currentUser?._id !== member._id && (
                              <div className="flex items-center gap-1 border-l border-slate-100 pl-2 ml-1">
                                {currentUser?.role === 'super_admin' && (
                                  <>
                                    {member.status === 'suspended' ? (
                                      <button 
                                        onClick={() => handleReactivateUser(member._id)}
                                        className="p-2 hover:bg-white hover:shadow-md rounded-xl text-emerald-400 hover:text-emerald-600 transition-all"
                                        title="Reactivate User"
                                      >
                                        <PlayCircle size={18} />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleSuspendUser(member._id)}
                                        className="p-2 hover:bg-white hover:shadow-md rounded-xl text-amber-400 hover:text-amber-600 transition-all"
                                        title="Suspend User"
                                      >
                                        <PauseCircle size={18} />
                                      </button>
                                    )}
                                  </>
                                )}
                                <button 
                                  onClick={() => { setEditingUser(member); setShowResetPasswordModal(true); }}
                                  className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
                                  title="Reset Password"
                                >
                                  <KeyRound size={18} />
                                </button>
                              </div>
                            )}

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Membership Details" : "Add New Staff Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="john@hospital.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label={editingUser ? "Password (leave blank to keep current)" : "Password"}
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required={!editingUser}
            />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">System Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
              >
                {currentUser?.role === 'super_admin' && <option value="admin">Administrator</option>}
                {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && <option value="receptionist">Receptionist</option>}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Phone Number" 
              type="tel" 
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Branch Assignment</label>
              
              {/* Selected Clinic Visual Indicator */}
              {selectedClinic && (
                <div className="mb-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-0.5">Active Context</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">
                      {selectedClinic?.clinicName || 'Loading...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Clinic selection dropdown removed as per request - using dashboard context */}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button type="submit" className="flex-[2] h-12 bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200">
              {editingUser ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Remove Staff Access"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Move to Trash?</h3>
          <p className="text-slate-500 mt-2 font-medium">
            You are about to move <span className="text-slate-900 font-bold">{userToDelete?.name}</span> to the trash bin. 
            They will be kept for 60 days before permanent deletion.
          </p>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="flex-1 h-14 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleDeleteUser} 
              disabled={isDeleting}
              className="flex-1 h-14 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : 'Yes, Move to Trash'}
            </Button>
          </div>
        </div>

      </Modal>
      
      {/* View Details Modal */}
      <Modal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        title="Staff Member Details"
        size="lg"
      >
        {viewingUser && (
          <div className="space-y-8 py-2">
            {/* Header / Profile Info */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-black text-blue-600 mb-4 border border-slate-100 overflow-hidden">
                {viewingUser.avatar ? <img src={getFullImageUrl(viewingUser.avatar)} className="w-full h-full object-cover" /> : viewingUser.name?.charAt(0)}
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{viewingUser.name}</h3>
              <p className="text-slate-500 font-medium">{viewingUser.email}</p>
              <div className="mt-4 flex gap-2">
                 <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getRoleBadge(viewingUser.role).color}`}>
                   {React.createElement(getRoleBadge(viewingUser.role).icon, { size: 14 })}
                   {getRoleBadge(viewingUser.role).label}
                 </span>
                 <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black border border-indigo-100 uppercase tracking-wider">
                   ID: {viewingUser._id?.slice(-6)}
                 </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-slate-300" /> {viewingUser.name}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail size={16} className="text-slate-300" /> {viewingUser.email}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone size={16} className="text-slate-300" /> {viewingUser.phone || 'Not Provided'}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Joined</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck size={16} className="text-slate-300" /> {new Date(viewingUser.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
              <div className="space-y-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm md:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Address</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-300" /> {viewingUser.address || 'N/A'}{viewingUser.city ? `, ${viewingUser.city}` : ''}{viewingUser.country ? `, ${viewingUser.country}` : ''}
                </p>
              </div>
            </div>

            <div className="pt-2">
               <Button onClick={() => setViewingUser(null)} className="w-full h-14 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                 Close Details
               </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        title="Administrative Password Reset"
      >
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
            <Lock className="text-amber-500 shrink-0" size={24} />
            <p className="text-sm text-amber-700 font-medium">
              Resetting password for <strong>{editingUser?.name}</strong>. This will force a logout from all active devices and sessions for security.
            </p>
          </div>
          <Input 
            label="New Secure Password"
            type="password"
            placeholder="At least 8 characters..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={() => setShowResetPasswordModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleResetPassword}
              disabled={!newPassword || isProcessing}
              className="flex-[2] h-12 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Reset & Logout User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transfer Data Modal */}
      <Modal
        isOpen={showTransferDataModal}
        onClose={() => setShowTransferDataModal(false)}
        title="Transfer Administrator Data"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
            <ArrowRightLeft className="text-blue-500 shrink-0" size={24} />
            <p className="text-sm text-blue-700 font-medium">
              Transfer all clinics, staff hierarchies, and doctor profiles from one administrator to another.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Source Administrator (From)</label>
              <select 
                value={transferData.fromAdminId}
                onChange={(e) => setTransferData({...transferData, fromAdminId: e.target.value})}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
              >
                <option value="">Select Source Admin</option>
                {staff.filter(s => s.role === 'admin').map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Target Administrator (To)</label>
              <select 
                value={transferData.toAdminId}
                onChange={(e) => setTransferData({...transferData, toAdminId: e.target.value})}
                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
              >
                <option value="">Select Target Admin</option>
                {staff.filter(s => s.role === 'admin' && s._id !== transferData.fromAdminId).map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setShowTransferDataModal(false)} className="flex-1 h-12 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleTransferData}
              disabled={!transferData.fromAdminId || !transferData.toAdminId || isProcessing}
              className="flex-[2] h-12 bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : 'Execute Data Transfer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activity Logs Modal */}
      <Modal
        isOpen={showActivityLogsModal}
        onClose={() => setShowActivityLogsModal(false)}
        title="Administrative Activity Logs"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {isProcessing && activityLogs.length === 0 ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
              <p className="font-bold text-slate-400">Loading audit trails...</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <History className="text-slate-300 mx-auto mb-4" size={40} />
              <p className="font-bold text-slate-400">No activity logs found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log._id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        log.action.includes('SUSPEND') ? 'bg-amber-50 text-amber-600' :
                        log.action.includes('DELETE') ? 'bg-red-50 text-red-600' :
                        log.action.includes('RESET') ? 'bg-indigo-50 text-indigo-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {log.action.includes('PASSWORD') ? <KeyRound size={18} /> : 
                         log.action.includes('TRANSFER') ? <ArrowRightLeft size={18} /> : 
                         log.action.includes('DELETE') ? <Trash2 size={18} /> : <History size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                          <span className="text-[10px] font-bold text-slate-400">•</span>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">{log.details}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-[10px] font-bold text-blue-600">BY: {log.user?.name || 'System'}</p>
                          <p className="text-[10px] font-bold text-slate-300">IP: {log.ipAddress || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="pt-6">
           <Button onClick={() => setShowActivityLogsModal(false)} className="w-full h-12 bg-slate-100 text-slate-900 font-bold rounded-2xl">Close Logs</Button>
        </div>
      </Modal>

      {/* Trash Bin Modal */}
      <Modal
        isOpen={showTrashBinModal}
        onClose={() => setShowTrashBinModal(false)}
        title="Trash Bin (Restorable within 60 days)"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {isProcessing && trashItems.length === 0 ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
              <p className="font-bold text-slate-400">Searching the vault...</p>
            </div>
          ) : trashItems.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <RefreshCw className="text-slate-300 mx-auto mb-4" size={40} />
              <p className="font-bold text-slate-400">Your trash bin is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 mb-2">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <p className="text-xs text-amber-700 font-medium">
                  Items here are automatically deleted forever after 60 days. Restoring an Admin will also restore their clinics, receptionists, and doctors.
                </p>
              </div>
              
              {/* Grouping trash items by adminId to make it cleaner */}
              {Array.from(new Set(trashItems.map(i => i.adminId))).map(adminId => {
                const adminItem = trashItems.find(i => i.originalId === adminId && i.collectionName === 'users');
                if (!adminItem) return null;
                
                return (
                  <div key={adminId} className="p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-600">
                          {adminItem.data.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{adminItem.data.name} (Admin)</p>
                          <p className="text-xs text-slate-400 font-medium">Deleted on {new Date(adminItem.deletedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleRestoreData(adminId)}
                        className="h-10 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2"
                      >
                        <RotateCcw size={16} /> Restore All
                      </Button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
                        {trashItems.filter(i => i.adminId === adminId && i.collectionName === 'clinics').length} Clinics
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
                        {trashItems.filter(i => i.adminId === adminId && i.collectionName === 'users' && i.originalId !== adminId).length} Staff Members
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="pt-6">
           <Button onClick={() => setShowTrashBinModal(false)} className="w-full h-12 bg-slate-100 text-slate-900 font-bold rounded-2xl">Close Trash Bin</Button>
        </div>
      </Modal>
    </div>
  );
}

function AdminTree({ 
  admin, onEdit, onDelete, currentUser, 
  handleSuspendUser, handleReactivateUser, 
  setEditingUser, setShowResetPasswordModal, setViewingUser
}) {

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
      {/* Admin Row */}
      <div className="bg-blue-50/30 p-6 border-b border-blue-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">
            {admin.name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-900">{admin.name}</h3>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">ADMIN</span>
              {admin.status === 'suspended' && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider animate-pulse">SUSPENDED</span>
              )}
              {admin.status === 'pending' && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">PENDING APPROVAL</span>
              )}
              {admin.branchName && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} /> {admin.branchName}
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium text-sm">{admin.email}</p>
          </div>

        </div>
        <div className="flex items-center gap-2">
          {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && admin._id !== currentUser.id && (
            <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl shadow-sm mr-2">
              {admin.status === 'suspended' ? (
                <button 
                  onClick={() => handleReactivateUser(admin._id)}
                  className="p-2 hover:bg-white rounded-lg text-emerald-500 transition-all"
                  title="Reactivate Admin"
                >
                  <PlayCircle size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => handleSuspendUser(admin._id)}
                  className="p-2 hover:bg-white rounded-lg text-amber-500 transition-all"
                  title="Suspend Admin"
                >
                  <PauseCircle size={18} />
                </button>
              )}
              <button 
                onClick={() => { setEditingUser(admin); setShowResetPasswordModal(true); }}
                className="p-2 hover:bg-white rounded-lg text-indigo-600 transition-all"
                title="Reset Password"
              >
                <KeyRound size={18} />
              </button>
            </div>
          )}
          <button onClick={() => onEdit(admin)} className="p-3 hover:bg-white rounded-xl text-blue-600 transition-all shadow-sm" title="Edit Admin"><Edit size={20}/></button>
          <button onClick={() => onDelete(admin)} className="p-3 hover:bg-white rounded-xl text-red-500 transition-all shadow-sm" title="Move to Trash"><Trash2 size={20}/></button>
        </div>

      </div>

      <div className="p-6 space-y-6">
        {/* Receptionists */}
        {admin.receptionists?.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Receptionists</h4>
            <div className="grid grid-cols-1 gap-4">
              {admin.receptionists.map((sub) => (
                <div key={sub._id} className="border border-slate-100 rounded-3xl p-5 ml-4 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {sub.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 leading-none">{sub.name}</p>
                          {sub.status === 'suspended' && (
                            <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[8px] font-black uppercase border border-red-100">PAUSED</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">RECEPTIONIST</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                        <div className="flex items-center gap-1 mr-1">
                          {sub.status === 'suspended' ? (
                            <button onClick={() => handleReactivateUser(sub._id)} className="p-1.5 hover:bg-white rounded-lg text-emerald-500 transition-all" title="Reactivate"><PlayCircle size={14}/></button>
                          ) : (
                            <button onClick={() => handleSuspendUser(sub._id)} className="p-1.5 hover:bg-white rounded-lg text-amber-500 transition-all" title="Suspend"><PauseCircle size={14}/></button>
                          )}
                          <button onClick={() => { setEditingUser(sub); setShowResetPasswordModal(true); }} className="p-1.5 hover:bg-white rounded-lg text-indigo-600 transition-all" title="Reset Password"><KeyRound size={14}/></button>
                        </div>
                      )}
                      <button onClick={() => setViewingUser(sub)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all" title="View Details"><Eye size={16}/></button>
                      <button onClick={() => onEdit(sub)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all" title="Edit Receptionist"><Edit size={16}/></button>
                      <button onClick={() => onDelete(sub)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all" title="Move to Trash"><Trash2 size={16}/></button>
                    </div>


                  </div>
                  
                  {/* Doctors under Receptionist */}
                  {sub.doctors?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-2">
                      {sub.doctors.map(doc => (
                        <DoctorCard 
                          key={doc._id} 
                          doctor={doc} 
                          onEdit={onEdit} 
                          onDelete={onDelete} 
                          setViewingUser={setViewingUser}
                          setShowResetPasswordModal={setShowResetPasswordModal}
                          setEditingUser={setEditingUser}
                          handleSuspendUser={handleSuspendUser}
                          handleReactivateUser={handleReactivateUser}
                          currentUser={currentUser}
                        />
                      ))}


                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-slate-300 ml-2 italic">No doctors assigned</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Doctors */}
        {admin.doctors?.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Direct Doctors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ml-4">
              {admin.doctors.map(doc => (
                <DoctorCard 
                  key={doc._id} 
                  doctor={doc} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                  setViewingUser={setViewingUser}
                  setShowResetPasswordModal={setShowResetPasswordModal}
                  setEditingUser={setEditingUser}
                  handleSuspendUser={handleSuspendUser}
                  handleReactivateUser={handleReactivateUser}
                  currentUser={currentUser}
                />
              ))}


            </div>
          </div>
        )}

        {(!admin.receptionists?.length && !admin.doctors?.length) && (
          <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <p className="text-slate-400 font-bold text-sm italic">This administrator hasn't added any staff yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ 
  doctor, onEdit, onDelete, setViewingUser, 
  setShowResetPasswordModal, setEditingUser,
  handleSuspendUser, handleReactivateUser, currentUser
}) {


  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 overflow-hidden">
          {doctor.avatar ? <img src={getFullImageUrl(doctor.avatar)} className="w-full h-full object-cover" /> : doctor.name?.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{doctor.name}</p>
            {doctor.status === 'suspended' && (
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[8px] font-black uppercase border border-red-100">PAUSED</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{doctor.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setViewingUser({ ...doctor, _id: doctor.user?._id || doctor._id })}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-blue-500 transition-all"
          title="View Details"
        >
          <Eye size={14} />
        </button>
        <button 
          onClick={() => { setEditingUser({ ...doctor, _id: doctor.user?._id || doctor._id }); setShowResetPasswordModal(true); }}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-indigo-500 transition-all"
          title="Reset Password"
        >
          <KeyRound size={14} />
        </button>
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <div className="flex items-center">
            {doctor.status === 'suspended' ? (
              <button 
                onClick={() => handleReactivateUser(doctor.user?._id || doctor._id)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-emerald-500 transition-all"
                title="Reactivate Doctor"
              >
                <PlayCircle size={14} />
              </button>
            ) : (
              <button 
                onClick={() => handleSuspendUser(doctor.user?._id || doctor._id)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-amber-500 transition-all"
                title="Suspend Doctor"
              >
                <PauseCircle size={14} />
              </button>
            )}
          </div>
        )}

        <button 
          onClick={() => onDelete({ ...doctor, _id: doctor.user?._id || doctor._id })}
          className="p-1.5 hover:bg-slate-50 rounded-lg text-red-400 transition-all"
          title="Move to Trash"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>

  );
}
