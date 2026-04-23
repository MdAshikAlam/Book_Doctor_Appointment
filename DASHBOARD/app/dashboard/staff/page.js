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
  MoreVertical
} from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function StaffManagementPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'hierarchy'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sub_admin',
    phone: '',
  });

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
    setEditingUser(null);
    setFormData({ 
      name: '', email: '', password: '', 
      role: currentUser?.role === 'super_admin' ? 'admin' : 'sub_admin', 
      phone: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingUser(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '', // Optional for edit
      role: member.role || 'sub_admin',
      phone: member.phone || '',
    });
    setIsModalOpen(true);
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

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return { label: 'Super Admin', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: ShieldAlert };
      case 'admin': return { label: 'Admin', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: ShieldCheck };
      case 'sub_admin': return { label: 'Sub Admin', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Shield };
      case 'doctor': return { label: 'Doctor', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Users };
      default: return { label: role, color: 'bg-slate-50 text-slate-600 border-slate-100', icon: Users };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admins & Staff Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage platform administrators, sub-admins, and medical staff permissions.</p>
        </div>
        {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <Button 
            onClick={handleOpenAddModal}
            className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <UserPlus size={20} /> Add Member
          </Button>
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

        {currentUser?.role === 'super_admin' && (
          <div className="flex bg-slate-50 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Flat List
            </button>
            <button 
              onClick={() => setViewMode('hierarchy')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'hierarchy' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Hierarchy
            </button>
          </div>
        )}
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
              <AdminTree key={admin._id} admin={admin} onEdit={handleOpenEditModal} onDelete={setUserToDelete} />
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
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400">
                      <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="font-bold">Fetching system staff...</p>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-500">
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
                              {member.avatar ? <img src={member.avatar} alt="" /> : member.name?.charAt(0)}
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
                        <td className="px-6 py-5 font-bold text-slate-600 text-sm">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            {currentUser?.role === 'super_admin' && (
                              <button 
                                onClick={() => handleOpenEditModal(member)}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {currentUser?.role === 'super_admin' && currentUser?._id !== member._id && (
                              <button 
                                onClick={() => setUserToDelete(member)}
                                className="p-2 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
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
                {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                {currentUser?.role === 'super_admin' && <option value="admin">Administrator</option>}
                <option value="sub_admin">Sub Admin</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
          </div>
          <Input 
            label="Phone Number (Optional)" 
            type="tel" 
            placeholder="+1 234 567 890"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
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
          <h3 className="text-xl font-extrabold text-slate-900">Are you sure?</h3>
          <p className="text-slate-500 mt-2 font-medium">
            You are about to remove <span className="text-slate-900 font-bold">{userToDelete?.name}</span>'s access to the platform. This cannot be undone.
          </p>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => setUserToDelete(null)} className="flex-1 h-14 rounded-2xl font-bold">Cancel</Button>
            <Button 
              onClick={handleDeleteUser} 
              disabled={isDeleting}
              className="flex-1 h-14 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-600 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : 'Yes, Remove'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminTree({ admin, onEdit, onDelete }) {
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
            </div>
            <p className="text-slate-500 font-medium text-sm">{admin.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(admin)} className="p-3 hover:bg-white rounded-xl text-blue-600 transition-all shadow-sm"><Edit size={20}/></button>
          <button onClick={() => onDelete(admin)} className="p-3 hover:bg-white rounded-xl text-red-500 transition-all shadow-sm"><Trash2 size={20}/></button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sub Admins */}
        {admin.subAdmins?.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Sub Administrators</h4>
            <div className="grid grid-cols-1 gap-4">
              {admin.subAdmins.map((sub) => (
                <div key={sub._id} className="border border-slate-100 rounded-3xl p-5 ml-4 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {sub.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{sub.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">SUB ADMIN</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(sub)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Edit size={16}/></button>
                      <button onClick={() => onDelete(sub)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  
                  {/* Doctors under Sub Admin */}
                  {sub.doctors?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-2">
                      {sub.doctors.map(doc => (
                        <DoctorCard key={doc._id} doctor={doc} onEdit={onEdit} onDelete={onDelete} />
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
                <DoctorCard key={doc._id} doctor={doc} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        )}

        {(!admin.subAdmins?.length && !admin.doctors?.length) && (
          <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
            <p className="text-slate-400 font-bold text-sm italic">This administrator hasn't added any staff yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorCard({ doctor, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
          {doctor.avatar ? <img src={doctor.avatar} className="w-full h-full rounded-full object-cover" /> : doctor.name?.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{doctor.name}</p>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{doctor.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(doctor)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"><Edit size={14}/></button>
        <button onClick={() => onDelete(doctor)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
      </div>
    </div>
  );
}
